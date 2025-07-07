-- Allow users to create dealerships during profile setup
CREATE POLICY "Users can create new dealerships" 
ON public.dealerships 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Also allow users to update their dealership information
CREATE POLICY "Users can update their dealership" 
ON public.dealerships 
FOR UPDATE 
TO authenticated 
USING (id = (
  SELECT p.dealership_id 
  FROM public.profiles p 
  WHERE p.user_id = auth.uid()
));