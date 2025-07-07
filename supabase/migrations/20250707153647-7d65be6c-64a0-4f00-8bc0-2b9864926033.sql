-- Double check and fix the dealership creation policy
-- Make sure it targets the correct role

DROP POLICY IF EXISTS "Authenticated users can create dealerships" ON public.dealerships;

CREATE POLICY "Authenticated users can create dealerships" 
ON public.dealerships 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Also ensure the policy is enabled
ALTER TABLE public.dealerships FORCE ROW LEVEL SECURITY;