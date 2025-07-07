-- Fix critical RLS policy gaps and strengthen authorization

-- 1. Strengthen dealership access policies
DROP POLICY IF EXISTS "Users can create dealerships" ON public.dealerships;

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

-- 4. Add data isolation validation for all operations
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