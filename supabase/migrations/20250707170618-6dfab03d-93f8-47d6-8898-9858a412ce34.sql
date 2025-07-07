-- Fix critical RLS policy gaps and strengthen authorization

-- 1. Strengthen dealership access policies
DROP POLICY IF EXISTS "Users can create dealerships" ON public.dealerships;
DROP POLICY IF EXISTS "Users can create dealerships they own" ON public.dealerships;

CREATE POLICY "Users can only create one dealership as owner" 
ON public.dealerships 
FOR INSERT 
WITH CHECK (
  auth.uid() = owner_id AND 
  NOT EXISTS (
    SELECT 1 FROM public.dealerships 
    WHERE owner_id = auth.uid()
  )
);

-- 2. Add missing RLS policy for profile creation restriction
CREATE POLICY "Users can only create their own profile once" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid()
  )
);

-- 3. Strengthen role assignment security
CREATE OR REPLACE FUNCTION public.can_assign_role(target_role_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role TEXT;
  target_role_name TEXT;
BEGIN
  -- Get current user's role
  SELECT r.name INTO current_user_role
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.user_id = auth.uid();
  
  -- Get target role name
  SELECT name INTO target_role_name
  FROM public.roles
  WHERE id = target_role_id;
  
  -- Only admins can assign roles, and they can't assign admin role
  RETURN (current_user_role = 'admin' AND target_role_name != 'admin');
END;
$$;

-- 4. Add role assignment validation to profiles
CREATE POLICY "Only admins can assign specific roles" 
ON public.profiles 
FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  (user_has_permission('users.edit') AND can_assign_role(NEW.role_id))
);

-- 5. Add data isolation validation for all customer operations
CREATE OR REPLACE FUNCTION public.validate_dealership_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_dealership_id UUID;
BEGIN
  -- Get user's dealership
  SELECT dealership_id INTO user_dealership_id
  FROM public.profiles
  WHERE user_id = auth.uid();
  
  -- Ensure the operation is within user's dealership
  IF NEW.dealership_id != user_dealership_id THEN
    RAISE EXCEPTION 'Access denied: operation outside user dealership';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply validation trigger to critical tables
DROP TRIGGER IF EXISTS validate_customer_dealership ON public.customers;
CREATE TRIGGER validate_customer_dealership
  BEFORE INSERT OR UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION validate_dealership_access();

DROP TRIGGER IF EXISTS validate_lead_dealership ON public.leads;  
CREATE TRIGGER validate_lead_dealership
  BEFORE INSERT OR UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION validate_dealership_access();

DROP TRIGGER IF EXISTS validate_vehicle_dealership ON public.vehicles;
CREATE TRIGGER validate_vehicle_dealership
  BEFORE INSERT OR UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION validate_dealership_access();

-- 6. Add rate limiting for sensitive operations
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  action_name TEXT,
  max_attempts INTEGER DEFAULT 5,
  window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count INTEGER;
BEGIN
  -- Clean old entries
  DELETE FROM public.rate_limits 
  WHERE window_start < now() - (window_minutes || ' minutes')::INTERVAL;
  
  -- Get current count for this user/action
  SELECT COALESCE(SUM(count), 0) INTO current_count
  FROM public.rate_limits
  WHERE user_id = auth.uid() 
    AND action = action_name
    AND window_start > now() - (window_minutes || ' minutes')::INTERVAL;
  
  -- Check if limit exceeded
  IF current_count >= max_attempts THEN
    RETURN FALSE;
  END IF;
  
  -- Log this attempt
  INSERT INTO public.rate_limits (user_id, action, count)
  VALUES (auth.uid(), action_name, 1)
  ON CONFLICT (user_id, action, date_trunc('hour', window_start))
  DO UPDATE SET count = rate_limits.count + 1;
  
  RETURN TRUE;
END;
$$;