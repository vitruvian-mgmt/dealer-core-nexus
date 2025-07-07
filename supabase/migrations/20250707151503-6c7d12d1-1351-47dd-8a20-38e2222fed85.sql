-- Drop the existing INSERT policy that isn't working
DROP POLICY IF EXISTS "Users can create new dealerships" ON public.dealerships;

-- Create a better INSERT policy that allows authenticated users to create dealerships
CREATE POLICY "Authenticated users can create dealerships" 
ON public.dealerships 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() IS NOT NULL);

-- Also check if we need to enable RLS on dealerships (it should already be enabled)
-- This is just to make sure
ALTER TABLE public.dealerships ENABLE ROW LEVEL SECURITY;