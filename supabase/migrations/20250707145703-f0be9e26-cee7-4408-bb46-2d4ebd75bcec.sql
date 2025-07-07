-- Phase 4: Advanced Features - Audit Logging and Automated Systems

-- Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
  changed_fields TEXT[];
  field_name TEXT;
BEGIN
  -- Convert OLD and NEW to JSONB
  IF TG_OP = 'DELETE' THEN
    old_data = to_jsonb(OLD);
    new_data = NULL;
  ELSIF TG_OP = 'INSERT' THEN
    old_data = NULL;
    new_data = to_jsonb(NEW);
  ELSE -- UPDATE
    old_data = to_jsonb(OLD);
    new_data = to_jsonb(NEW);
    
    -- Find changed fields
    changed_fields = ARRAY[]::TEXT[];
    FOR field_name IN SELECT key FROM jsonb_object_keys(new_data) keys(key)
    LOOP
      IF old_data ->> field_name IS DISTINCT FROM new_data ->> field_name THEN
        changed_fields = array_append(changed_fields, field_name);
      END IF;
    END LOOP;
  END IF;

  -- Insert audit record
  INSERT INTO public.audit_logs (
    dealership_id,
    table_name,
    record_id,
    action,
    old_values,
    new_values,
    changed_fields,
    user_id,
    ip_address
  ) VALUES (
    COALESCE(
      (CASE WHEN TG_OP = 'DELETE' THEN OLD.dealership_id ELSE NEW.dealership_id END),
      (SELECT p.dealership_id FROM public.profiles p WHERE p.user_id = auth.uid())
    ),
    TG_TABLE_NAME,
    CASE 
      WHEN TG_OP = 'DELETE' THEN (old_data ->> 'id')::UUID
      ELSE (new_data ->> 'id')::UUID
    END,
    TG_OP,
    old_data,
    new_data,
    changed_fields,
    auth.uid(),
    inet_client_addr()
  );

  RETURN CASE TG_OP 
    WHEN 'DELETE' THEN OLD
    ELSE NEW
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to all main business tables
CREATE TRIGGER audit_vehicles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_customers_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_leads_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_parts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.parts
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_service_jobs_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.service_jobs
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_invoices_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_payments_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Create automatic notification triggers for important events
CREATE OR REPLACE FUNCTION public.create_notification(
  dealership_uuid UUID,
  user_uuid UUID,
  title_text TEXT,
  message_text TEXT,
  notification_type TEXT DEFAULT 'info',
  reference_type_text TEXT DEFAULT NULL,
  reference_uuid UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    dealership_id,
    user_id,
    title,
    message,
    type,
    channel,
    reference_type,
    reference_id,
    sent_at
  ) VALUES (
    dealership_uuid,
    user_uuid,
    title_text,
    message_text,
    notification_type,
    'in_app',
    reference_type_text,
    reference_uuid,
    now()
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for low inventory alerts
CREATE OR REPLACE FUNCTION public.check_inventory_levels()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if quantity fell below reorder threshold
  IF (TG_OP = 'UPDATE' OR TG_OP = 'INSERT') AND 
     NEW.quantity <= NEW.reorder_threshold AND 
     (TG_OP = 'INSERT' OR OLD.quantity > OLD.reorder_threshold) THEN
    
    -- Create notification for inventory managers
    INSERT INTO public.notifications (
      dealership_id,
      title,
      message,
      type,
      channel,
      reference_type,
      reference_id,
      sent_at
    )
    SELECT 
      NEW.dealership_id,
      'Low Inventory Alert',
      'Part "' || NEW.name || '" is running low (Current: ' || NEW.quantity || ', Threshold: ' || NEW.reorder_threshold || ')',
      'warning',
      'in_app',
      'parts',
      NEW.id,
      now()
    FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.dealership_id = NEW.dealership_id
    AND r.name IN ('admin', 'inventory_manager');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER inventory_level_check_trigger
  AFTER INSERT OR UPDATE OF quantity ON public.parts
  FOR EACH ROW EXECUTE FUNCTION public.check_inventory_levels();

-- Trigger for service job status changes
CREATE OR REPLACE FUNCTION public.service_job_status_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify when service job is completed
  IF TG_OP = 'UPDATE' AND OLD.status != 'completed' AND NEW.status = 'completed' THEN
    -- Notify customer (would typically send SMS/Email in production)
    PERFORM public.create_notification(
      NEW.dealership_id,
      NULL, -- No specific user for customer notifications
      'Service Completed',
      'Your service job #' || NEW.job_number || ' has been completed.',
      'success',
      'service_jobs',
      NEW.id
    );
    
    -- Update completed_at timestamp
    NEW.completed_at = now();
  END IF;
  
  -- Notify when service job is started
  IF TG_OP = 'UPDATE' AND OLD.status != 'in_progress' AND NEW.status = 'in_progress' THEN
    NEW.started_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER service_job_status_trigger
  BEFORE UPDATE OF status ON public.service_jobs
  FOR EACH ROW EXECUTE FUNCTION public.service_job_status_notification();

-- Function to generate unique invoice numbers
CREATE OR REPLACE FUNCTION public.generate_invoice_number(dealership_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  year_suffix TEXT;
  sequence_num INTEGER;
  invoice_num TEXT;
BEGIN
  year_suffix = EXTRACT(YEAR FROM now())::TEXT;
  
  -- Get next sequence number for this dealership and year
  SELECT COALESCE(MAX(
    CASE 
      WHEN invoice_number LIKE 'INV-' || year_suffix || '-%' 
      THEN (split_part(invoice_number, '-', 3))::INTEGER
      ELSE 0 
    END
  ), 0) + 1
  INTO sequence_num
  FROM public.invoices 
  WHERE dealership_id = dealership_uuid;
  
  invoice_num = 'INV-' || year_suffix || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN invoice_num;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate unique service job numbers
CREATE OR REPLACE FUNCTION public.generate_job_number(dealership_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  year_suffix TEXT;
  sequence_num INTEGER;
  job_num TEXT;
BEGIN
  year_suffix = EXTRACT(YEAR FROM now())::TEXT;
  
  -- Get next sequence number for this dealership and year
  SELECT COALESCE(MAX(
    CASE 
      WHEN job_number LIKE 'JOB-' || year_suffix || '-%' 
      THEN (split_part(job_number, '-', 3))::INTEGER
      ELSE 0 
    END
  ), 0) + 1
  INTO sequence_num
  FROM public.service_jobs 
  WHERE dealership_id = dealership_uuid;
  
  job_num = 'JOB-' || year_suffix || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN job_num;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate unique payment numbers
CREATE OR REPLACE FUNCTION public.generate_payment_number(dealership_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  year_suffix TEXT;
  sequence_num INTEGER;
  payment_num TEXT;
BEGIN
  year_suffix = EXTRACT(YEAR FROM now())::TEXT;
  
  -- Get next sequence number for this dealership and year
  SELECT COALESCE(MAX(
    CASE 
      WHEN payment_number LIKE 'PAY-' || year_suffix || '-%' 
      THEN (split_part(payment_number, '-', 3))::INTEGER
      ELSE 0 
    END
  ), 0) + 1
  INTO sequence_num
  FROM public.payments 
  WHERE dealership_id = dealership_uuid;
  
  payment_num = 'PAY-' || year_suffix || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN payment_num;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-generate invoice numbers
CREATE OR REPLACE FUNCTION public.set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number = public.generate_invoice_number(NEW.dealership_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_invoice_number_trigger
  BEFORE INSERT ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.set_invoice_number();

-- Trigger to auto-generate service job numbers
CREATE OR REPLACE FUNCTION public.set_job_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.job_number IS NULL OR NEW.job_number = '' THEN
    NEW.job_number = public.generate_job_number(NEW.dealership_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_job_number_trigger
  BEFORE INSERT ON public.service_jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_job_number();

-- Trigger to auto-generate payment numbers
CREATE OR REPLACE FUNCTION public.set_payment_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_number IS NULL OR NEW.payment_number = '' THEN
    NEW.payment_number = public.generate_payment_number(NEW.dealership_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_payment_number_trigger
  BEFORE INSERT ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_payment_number();

-- Function to update invoice totals when payments are added
CREATE OR REPLACE FUNCTION public.update_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
  total_paid DECIMAL(10,2);
BEGIN
  -- Calculate total payments for the invoice
  SELECT COALESCE(SUM(amount), 0)
  INTO total_paid
  FROM public.payments
  WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  -- Update invoice amounts
  UPDATE public.invoices
  SET 
    amount_paid = total_paid,
    amount_due = total_amount - total_paid,
    status = CASE 
      WHEN total_paid >= total_amount THEN 'paid'
      WHEN total_paid > 0 THEN 'partial'
      ELSE 'unpaid'
    END,
    updated_at = now()
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_invoice_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_invoice_totals();

-- Create indexes for better audit log performance  
CREATE INDEX idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_user_date ON public.audit_logs(user_id, created_at);

-- Grant appropriate permissions to authenticated users
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT SELECT ON public.notifications TO authenticated;

-- Create view for dashboard statistics
CREATE OR REPLACE VIEW public.dashboard_stats AS
SELECT 
  d.id as dealership_id,
  d.name as dealership_name,
  
  -- Sales stats
  (SELECT COUNT(*) FROM public.invoices i WHERE i.dealership_id = d.id AND i.invoice_type = 'sale') as total_sales,
  (SELECT COALESCE(SUM(total_amount), 0) FROM public.invoices i WHERE i.dealership_id = d.id AND i.invoice_type = 'sale' AND i.status = 'paid') as total_revenue,
  
  -- Inventory stats
  (SELECT COUNT(*) FROM public.vehicles v WHERE v.dealership_id = d.id AND v.status = 'available') as available_vehicles,
  (SELECT COUNT(*) FROM public.parts p WHERE p.dealership_id = d.id AND p.quantity <= p.reorder_threshold) as low_stock_parts,
  
  -- Service stats
  (SELECT COUNT(*) FROM public.service_jobs sj WHERE sj.dealership_id = d.id AND sj.status = 'in_progress') as active_service_jobs,
  
  -- Customer stats
  (SELECT COUNT(*) FROM public.customers c WHERE c.dealership_id = d.id) as total_customers,
  (SELECT COUNT(*) FROM public.leads l WHERE l.dealership_id = d.id AND l.status = 'new') as new_leads
  
FROM public.dealerships d;

-- Enable RLS on the view
ALTER VIEW public.dashboard_stats SET (security_barrier = true);

-- Grant select permission on the view
GRANT SELECT ON public.dashboard_stats TO authenticated;