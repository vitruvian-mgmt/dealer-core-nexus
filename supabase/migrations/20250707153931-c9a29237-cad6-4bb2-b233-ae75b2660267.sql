-- Add owner_id column to dealerships table
ALTER TABLE public.dealerships 
ADD COLUMN owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update the existing dealership to have an owner_id
UPDATE public.dealerships 
SET owner_id = '181f7a3d-dab4-459a-a1b2-26748e728488'
WHERE name = 'Trucks and Boats';

-- Update RLS policies to use owner_id for dealership creation and access
DROP POLICY IF EXISTS "Authenticated users can create dealerships" ON public.dealerships;
DROP POLICY IF EXISTS "Users can view their dealership" ON public.dealerships;
DROP POLICY IF EXISTS "Users can update their dealership" ON public.dealerships;

-- Allow authenticated users to create dealerships they own
CREATE POLICY "Users can create dealerships they own" 
ON public.dealerships 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = owner_id);

-- Allow users to view dealerships they own
CREATE POLICY "Users can view their own dealerships" 
ON public.dealerships 
FOR SELECT 
TO authenticated
USING (auth.uid() = owner_id);

-- Allow users to update dealerships they own
CREATE POLICY "Users can update their own dealerships" 
ON public.dealerships 
FOR UPDATE 
TO authenticated
USING (auth.uid() = owner_id);

-- Also allow users to view dealerships they're associated with via profiles
CREATE POLICY "Users can view dealerships they're associated with" 
ON public.dealerships 
FOR SELECT 
TO authenticated
USING (
  id IN (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);