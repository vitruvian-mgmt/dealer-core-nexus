-- Phase 2: Complete Business Domain Schema

-- Vehicles table for inventory management
CREATE TABLE public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dealership_id UUID NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  vin TEXT UNIQUE NOT NULL,
  make TEXT,
  model TEXT,
  year INTEGER,
  trim TEXT,
  body_style TEXT,
  engine TEXT,
  transmission TEXT,
  drivetrain TEXT,
  fuel_type TEXT,
  exterior_color TEXT,
  interior_color TEXT,
  mileage INTEGER,
  condition TEXT DEFAULT 'used',
  purchase_price DECIMAL(10,2),
  sale_price DECIMAL(10,2),
  status TEXT DEFAULT 'available',
  location TEXT,
  key_count INTEGER DEFAULT 2,
  notes TEXT,
  photos TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  date_acquired DATE,
  date_sold DATE,
  sold_to UUID REFERENCES public.customers(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Parts inventory table
CREATE TABLE public.parts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dealership_id UUID NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  part_number TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  brand TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  reorder_threshold INTEGER DEFAULT 10,
  unit_cost DECIMAL(10,2),
  sale_price DECIMAL(10,2),
  supplier_name TEXT,
  supplier_part_number TEXT,
  bin_location TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(dealership_id, part_number)
);

-- Service jobs table
CREATE TABLE public.service_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dealership_id UUID NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  job_number TEXT NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  vehicle_id UUID REFERENCES public.vehicles(id),
  vehicle_info JSONB, -- For non-inventory vehicles
  technician_id UUID REFERENCES auth.users(id),
  advisor_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'scheduled',
  priority TEXT DEFAULT 'normal',
  service_type TEXT NOT NULL,
  description TEXT,
  complaint TEXT,
  work_performed TEXT,
  parts_used JSONB DEFAULT '[]',
  labor_hours DECIMAL(4,2) DEFAULT 0,
  labor_rate DECIMAL(10,2),
  parts_total DECIMAL(10,2) DEFAULT 0,
  labor_total DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  internal_notes TEXT,
  photos TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(dealership_id, job_number)
);

-- Invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dealership_id UUID NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  vehicle_id UUID REFERENCES public.vehicles(id),
  service_job_id UUID REFERENCES public.service_jobs(id),
  invoice_type TEXT NOT NULL, -- 'sale', 'service', 'parts'
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,4) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  amount_due DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'draft',
  due_date DATE,
  notes TEXT,
  terms TEXT,
  line_items JSONB DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id),
  issued_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(dealership_id, invoice_number)
);

-- Payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dealership_id UUID NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  payment_number TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference_number TEXT,
  notes TEXT,
  processed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(dealership_id, payment_number)
);

-- Reports table for scheduled and saved reports
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dealership_id UUID NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL,
  parameters JSONB DEFAULT '{}',
  schedule_enabled BOOLEAN DEFAULT false,
  schedule_cron TEXT,
  delivery_method TEXT DEFAULT 'email',
  delivery_emails TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dealership_id UUID NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  channel TEXT NOT NULL, -- 'in_app', 'sms', 'email'
  reference_type TEXT,
  reference_id UUID,
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Audit logs table for compliance
CREATE TABLE public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  dealership_id UUID NOT NULL REFERENCES public.dealerships(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  record_id UUID,
  action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_vehicles_dealership_id ON public.vehicles(dealership_id);
CREATE INDEX idx_vehicles_vin ON public.vehicles(vin);
CREATE INDEX idx_vehicles_status ON public.vehicles(status);
CREATE INDEX idx_vehicles_make_model_year ON public.vehicles(make, model, year);

CREATE INDEX idx_parts_dealership_id ON public.parts(dealership_id);
CREATE INDEX idx_parts_part_number ON public.parts(part_number);
CREATE INDEX idx_parts_category ON public.parts(category);
CREATE INDEX idx_parts_quantity ON public.parts(quantity);

CREATE INDEX idx_service_jobs_dealership_id ON public.service_jobs(dealership_id);
CREATE INDEX idx_service_jobs_customer_id ON public.service_jobs(customer_id);
CREATE INDEX idx_service_jobs_technician_id ON public.service_jobs(technician_id);
CREATE INDEX idx_service_jobs_status ON public.service_jobs(status);
CREATE INDEX idx_service_jobs_scheduled_at ON public.service_jobs(scheduled_at);

CREATE INDEX idx_invoices_dealership_id ON public.invoices(dealership_id);
CREATE INDEX idx_invoices_customer_id ON public.invoices(customer_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_due_date ON public.invoices(due_date);

CREATE INDEX idx_payments_dealership_id ON public.payments(dealership_id);
CREATE INDEX idx_payments_invoice_id ON public.payments(invoice_id);
CREATE INDEX idx_payments_payment_date ON public.payments(payment_date);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_dealership_id ON public.notifications(dealership_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);

CREATE INDEX idx_audit_logs_dealership_id ON public.audit_logs(dealership_id);
CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX idx_audit_logs_record_id ON public.audit_logs(record_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Enable RLS for all new tables
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;