-- Create a profile for tdebique@gmail.com user and associate with "Trucks and Boats" dealership
-- First, let's get the dealership ID for "Trucks and Boats"
DO $$
DECLARE
    dealership_uuid uuid;
    user_uuid uuid;
    role_uuid uuid;
BEGIN
    -- Get the dealership ID for "Trucks and Boats"
    SELECT id INTO dealership_uuid FROM public.dealerships WHERE name = 'Trucks and Boats';
    
    -- We need to find the user ID for tdebique@gmail.com from auth.users
    -- Since we can't directly query auth.users, we'll create a profile that can be linked later
    -- For now, let's create a placeholder entry that can be updated when the user logs in
    
    -- Get the admin role for this dealership
    SELECT id INTO role_uuid FROM public.roles WHERE dealership_id = dealership_uuid AND name = 'admin';
    
    -- Insert a profile entry (this will need to be updated with the actual user_id when they log in)
    -- For now, we'll create a temporary profile that can be claimed by the user
    INSERT INTO public.profiles (
        user_id,
        email, 
        full_name,
        dealership_id,
        dealership_name,
        role_id,
        phone
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', -- Placeholder user_id that will be updated
        'tdebique@gmail.com',
        'T. Debique',
        dealership_uuid,
        'Trucks and Boats',
        role_uuid,
        NULL
    );
    
END $$;