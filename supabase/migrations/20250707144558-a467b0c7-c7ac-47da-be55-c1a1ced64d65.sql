-- Phase 1: Multi-Tenant Architecture Setup

-- First, let's create a proper dealerships table
CREATE TABLE public.dealerships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  license_number TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced roles system with JSONB permissions
CREATE TABLE public.roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dealership_id UUID NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(dealership_id, name)
);

-- Create default roles function
CREATE OR REPLACE FUNCTION public.create_default_roles(dealership_uuid UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.roles (dealership_id, name, permissions) VALUES
    (dealership_uuid, 'admin', '{
      "dashboard.view": true,
      "leads.view": true, "leads.create": true, "leads.edit": true, "leads.delete": true,
      "customers.view": true, "customers.create": true, "customers.edit": true, "customers.delete": true,
      "inventory.view": true, "inventory.create": true, "inventory.edit": true, "inventory.delete": true,
      "service.view": true, "service.create": true, "service.edit": true, "service.delete": true,
      "reports.view": true, "reports.create": true, "reports.export": true,
      "users.view": true, "users.create": true, "users.edit": true, "users.delete": true,
      "settings.view": true, "settings.edit": true
    }'),
    (dealership_uuid, 'sales_manager', '{
      "dashboard.view": true,
      "leads.view": true, "leads.create": true, "leads.edit": true, "leads.delete": true,
      "customers.view": true, "customers.create": true, "customers.edit": true,
      "inventory.view": true, "inventory.edit": true,
      "service.view": true,
      "reports.view": true, "reports.create": true, "reports.export": true,
      "users.view": true
    }'),
    (dealership_uuid, 'sales_rep', '{
      "dashboard.view": true,
      "leads.view": true, "leads.create": true, "leads.edit": true,
      "customers.view": true, "customers.create": true, "customers.edit": true,
      "inventory.view": true,
      "service.view": true
    }'),
    (dealership_uuid, 'technician', '{
      "dashboard.view": true,
      "service.view": true, "service.edit": true,
      "customers.view": true,
      "inventory.view": true
    }'),
    (dealership_uuid, 'inventory_manager', '{
      "dashboard.view": true,
      "inventory.view": true, "inventory.create": true, "inventory.edit": true, "inventory.delete": true,
      "service.view": true,
      "reports.view": true, "reports.create": true
    }'),
    (dealership_uuid, 'accountant', '{
      "dashboard.view": true,
      "reports.view": true, "reports.create": true, "reports.export": true,
      "customers.view": true,
      "service.view": true
    }');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Migrate existing data and update profiles table
ALTER TABLE public.profiles ADD COLUMN dealership_id UUID;

-- Create dealerships from existing data
DO $$
DECLARE
  dealership_record RECORD;
  new_dealership_id UUID;
BEGIN
  FOR dealership_record IN 
    SELECT DISTINCT dealership_name FROM public.profiles WHERE dealership_name IS NOT NULL
  LOOP
    INSERT INTO public.dealerships (name) 
    VALUES (dealership_record.dealership_name) 
    RETURNING id INTO new_dealership_id;
    
    -- Update profiles with dealership_id
    UPDATE public.profiles 
    SET dealership_id = new_dealership_id 
    WHERE dealership_name = dealership_record.dealership_name;
    
    -- Create default roles for this dealership
    PERFORM public.create_default_roles(new_dealership_id);
  END LOOP;
END $$;

-- Add role_id to profiles and link to new roles system
ALTER TABLE public.profiles ADD COLUMN role_id UUID;

-- Update profiles with role_id from new roles table
UPDATE public.profiles 
SET role_id = (
  SELECT r.id 
  FROM public.roles r 
  WHERE r.dealership_id = public.profiles.dealership_id 
  AND r.name = public.profiles.role::text
);

-- Make constraints not null after data migration
ALTER TABLE public.profiles ALTER COLUMN dealership_id SET NOT NULL;
ALTER TABLE public.profiles ADD CONSTRAINT fk_profiles_dealership 
  FOREIGN KEY (dealership_id) REFERENCES public.dealerships(id) ON DELETE CASCADE;
ALTER TABLE public.profiles ADD CONSTRAINT fk_profiles_role 
  FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE SET NULL;

-- Update customers and leads tables with dealership_id
ALTER TABLE public.customers ADD COLUMN dealership_id UUID;
ALTER TABLE public.leads ADD COLUMN dealership_id UUID;

-- Migrate existing customer data
UPDATE public.customers 
SET dealership_id = (
  SELECT d.id 
  FROM public.dealerships d 
  WHERE d.name = public.customers.dealership_name
);

-- Migrate existing leads data  
UPDATE public.leads 
SET dealership_id = (
  SELECT d.id 
  FROM public.dealerships d 
  WHERE d.name = public.leads.dealership_name
);

-- Make dealership_id not null and add constraints
ALTER TABLE public.customers ALTER COLUMN dealership_id SET NOT NULL;
ALTER TABLE public.customers ADD CONSTRAINT fk_customers_dealership 
  FOREIGN KEY (dealership_id) REFERENCES public.dealerships(id) ON DELETE CASCADE;

ALTER TABLE public.leads ALTER COLUMN dealership_id SET NOT NULL;
ALTER TABLE public.leads ADD CONSTRAINT fk_leads_dealership 
  FOREIGN KEY (dealership_id) REFERENCES public.dealerships(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.dealerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dealerships
CREATE POLICY "Users can view their dealership" 
ON public.dealerships 
FOR SELECT 
USING (
  id = (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

-- RLS Policies for roles
CREATE POLICY "Users can view roles in their dealership" 
ON public.roles 
FOR SELECT 
USING (
  dealership_id = (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

-- Update existing RLS policies to use dealership_id
DROP POLICY IF EXISTS "Users can view customers from their dealership" ON public.customers;
DROP POLICY IF EXISTS "Users can insert customers for their dealership" ON public.customers;  
DROP POLICY IF EXISTS "Users can update customers from their dealership" ON public.customers;

CREATE POLICY "Users can view customers from their dealership" 
ON public.customers 
FOR SELECT 
USING (
  dealership_id = (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert customers for their dealership" 
ON public.customers 
FOR INSERT 
WITH CHECK (
  dealership_id = (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update customers from their dealership" 
ON public.customers 
FOR UPDATE 
USING (
  dealership_id = (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete customers from their dealership" 
ON public.customers 
FOR DELETE 
USING (
  dealership_id = (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

-- Update leads RLS policies
DROP POLICY IF EXISTS "Users can view leads from their dealership" ON public.leads;
DROP POLICY IF EXISTS "Users can manage leads from their dealership" ON public.leads;

CREATE POLICY "Users can view leads from their dealership" 
ON public.leads 
FOR SELECT 
USING (
  dealership_id = (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage leads from their dealership" 
ON public.leads 
FOR ALL 
USING (
  dealership_id = (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

-- Update triggers to use dealership_id instead of dealership_name
DROP TRIGGER IF EXISTS set_customers_dealership ON public.customers;
DROP TRIGGER IF EXISTS set_leads_dealership ON public.leads;

CREATE OR REPLACE FUNCTION public.set_user_dealership_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.dealership_id = (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_customers_dealership_id
  BEFORE INSERT ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_dealership_id();

CREATE TRIGGER set_leads_dealership_id
  BEFORE INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_dealership_id();

-- Add triggers to dealerships and roles
CREATE TRIGGER update_dealerships_updated_at
  BEFORE UPDATE ON public.dealerships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();