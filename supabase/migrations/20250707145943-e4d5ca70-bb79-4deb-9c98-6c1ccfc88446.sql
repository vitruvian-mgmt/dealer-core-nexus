-- Fix dashboard_stats view security issue
DROP VIEW IF EXISTS public.dashboard_stats;

-- Recreate view without security_barrier (which causes SECURITY DEFINER)
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
ALTER VIEW public.dashboard_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for the view
CREATE POLICY "Users can view dashboard stats for their dealership" 
ON public.dashboard_stats 
FOR SELECT 
USING (dealership_id = (
  SELECT p.dealership_id 
  FROM public.profiles p 
  WHERE p.user_id = auth.uid()
));