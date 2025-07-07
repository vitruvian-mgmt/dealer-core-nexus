-- Fix dealership creation policy to allow authenticated users to create dealerships
-- The current policy prevents users from creating dealerships during profile creation

DROP POLICY IF EXISTS "Authenticated users can create dealerships" ON public.dealerships;

CREATE POLICY "Authenticated users can create dealerships" 
ON public.dealerships 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);