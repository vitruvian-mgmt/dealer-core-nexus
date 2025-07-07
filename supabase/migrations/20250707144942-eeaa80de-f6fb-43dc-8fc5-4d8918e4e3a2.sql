-- Phase 2: Comprehensive RLS Policies for all business tables

-- Create helper function for user permissions
CREATE OR REPLACE FUNCTION public.user_has_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.user_id = auth.uid()
    AND (r.permissions ->> permission_name)::boolean = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- RLS Policies for vehicles
CREATE POLICY "Users can view vehicles in their dealership" 
ON public.vehicles 
FOR SELECT 
USING (
  dealership_id = (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
  AND public.user_has_permission('inventory.view')
);

CREATE POLICY "Users can insert vehicles in their dealership" 
ON public.vehicles 
FOR INSERT 
WITH CHECK (
  dealership_id = (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
  AND public.user_has_permission('inventory.create')
);

CREATE POLICY "Users can update vehicles in their dealership" 
ON public.vehicles 
FOR UPDATE 
USING (
  dealership_id = (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
  AND public.user_has_permission('inventory.edit')
);

CREATE POLICY "Users can delete vehicles in their dealership" 
ON public.vehicles 
FOR DELETE 
USING (
  dealership_id = (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
  AND public.user_has_permission('inventory.delete')
);

-- RLS Policies for parts
CREATE POLICY "Users can view parts in their dealership" 
ON public.parts 
FOR SELECT 
USING (
  dealership_id = (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
  AND public.user_has_permission('inventory.view')
);

CREATE POLICY "Users can insert parts in their dealership" 
ON public.parts 
FOR INSERT 
WITH CHECK (
  dealership_id = (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
  AND public.user_has_permission('inventory.create')
);

CREATE POLICY "Users can update parts in their dealership" 
ON public.parts 
FOR UPDATE 
USING (
  dealership_id = (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
  AND public.user_has_permission('inventory.edit')
);

CREATE POLICY "Users can delete parts in their dealership" 
ON public.parts 
FOR DELETE 
USING (
  dealership_id = (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
  AND public.user_has_permission('inventory.delete')
);

-- RLS Policies for service_jobs
CREATE POLICY "Users can view service jobs in their dealership" 
ON public.service_jobs 
FOR SELECT 
USING (
  dealership_id = (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
  AND public.user_has_permission('service.view')
);

CREATE POLICY "Users can insert service jobs in their dealership" 
ON public.service_jobs 
FOR INSERT 
WITH CHECK (
  dealership_id = (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
  AND public.user_has_permission('service.create')
);

CREATE POLICY "Users can update service jobs in their dealership" 
ON public.service_jobs 
FOR UPDATE 
USING (
  dealership_id = (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
  AND public.user_has_permission('service.edit')
);

CREATE POLICY "Users can delete service jobs in their dealership" 
ON public.service_jobs 
FOR DELETE 
USING (
  dealership_id = (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
  AND public.user_has_permission('service.delete')
);

-- RLS Policies for invoices
CREATE POLICY "Users can view invoices in their dealership" 
ON public.invoices 
FOR SELECT 
USING (
  dealership_id = (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert invoices in their dealership" 
ON public.invoices 
FOR INSERT 
WITH CHECK (
  dealership_id = (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update invoices in their dealership" 
ON public.invoices 
FOR UPDATE 
USING (
  dealership_id = (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete invoices in their dealership" 
ON public.invoices 
FOR DELETE 
USING (
  dealership_id = (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

-- RLS Policies for payments
CREATE POLICY "Users can view payments in their dealership" 
ON public.payments 
FOR SELECT 
USING (
  dealership_id = (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert payments in their dealership" 
ON public.payments 
FOR INSERT 
WITH CHECK (
  dealership_id = (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update payments in their dealership" 
ON public.payments 
FOR UPDATE 
USING (
  dealership_id = (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete payments in their dealership" 
ON public.payments 
FOR DELETE 
USING (
  dealership_id = (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

-- RLS Policies for reports
CREATE POLICY "Users can view reports in their dealership" 
ON public.reports 
FOR SELECT 
USING (
  dealership_id = (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
  AND public.user_has_permission('reports.view')
);

CREATE POLICY "Users can insert reports in their dealership" 
ON public.reports 
FOR INSERT 
WITH CHECK (
  dealership_id = (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
  AND public.user_has_permission('reports.create')
);

CREATE POLICY "Users can update reports in their dealership" 
ON public.reports 
FOR UPDATE 
USING (
  dealership_id = (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
  AND public.user_has_permission('reports.create')
);

CREATE POLICY "Users can delete reports in their dealership" 
ON public.reports 
FOR DELETE 
USING (
  dealership_id = (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
  AND public.user_has_permission('reports.create')
);

-- RLS Policies for notifications
CREATE POLICY "Users can view their notifications" 
ON public.notifications 
FOR SELECT 
USING (
  user_id = auth.uid() 
  OR (
    dealership_id = (
      SELECT p.dealership_id 
      FROM public.profiles p 
      WHERE p.user_id = auth.uid()
    )
    AND user_id IS NULL
  )
);

CREATE POLICY "Users can insert notifications in their dealership" 
ON public.notifications 
FOR INSERT 
WITH CHECK (
  dealership_id = (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their notifications" 
ON public.notifications 
FOR UPDATE 
USING (user_id = auth.uid());

-- RLS Policies for audit_logs
CREATE POLICY "Users can view audit logs in their dealership" 
ON public.audit_logs 
FOR SELECT 
USING (
  dealership_id = (
    SELECT p.dealership_id 
    FROM public.profiles p 
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "System can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true);

-- Add automatic triggers for dealership assignment and timestamps
CREATE TRIGGER set_vehicles_dealership_id
  BEFORE INSERT ON public.vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_dealership_id();

CREATE TRIGGER set_parts_dealership_id
  BEFORE INSERT ON public.parts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_dealership_id();

CREATE TRIGGER set_service_jobs_dealership_id
  BEFORE INSERT ON public.service_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_dealership_id();

CREATE TRIGGER set_invoices_dealership_id
  BEFORE INSERT ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_dealership_id();

CREATE TRIGGER set_payments_dealership_id
  BEFORE INSERT ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_dealership_id();

CREATE TRIGGER set_reports_dealership_id
  BEFORE INSERT ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_dealership_id();

CREATE TRIGGER set_notifications_dealership_id
  BEFORE INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_dealership_id();

-- Update timestamp triggers
CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_parts_updated_at
  BEFORE UPDATE ON public.parts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_jobs_updated_at
  BEFORE UPDATE ON public.service_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();