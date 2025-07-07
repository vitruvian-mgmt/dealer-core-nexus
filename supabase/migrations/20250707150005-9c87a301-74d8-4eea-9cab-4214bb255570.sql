-- Fix dashboard_stats view security issue by using a function instead
DROP VIEW IF EXISTS public.dashboard_stats;

-- Create a security definer function to get dashboard stats for current user's dealership
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS TABLE (
  dealership_id uuid,
  dealership_name text,
  total_sales bigint,
  total_revenue numeric,
  available_vehicles bigint,
  low_stock_parts bigint,
  active_service_jobs bigint,
  total_customers bigint,
  new_leads bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_dealership_id uuid;
BEGIN
  -- Get the current user's dealership ID
  SELECT p.dealership_id INTO user_dealership_id
  FROM public.profiles p 
  WHERE p.user_id = auth.uid();
  
  -- Return stats only for user's dealership
  RETURN QUERY
  SELECT 
    d.id as dealership_id,
    d.name as dealership_name,
    
    -- Sales stats
    (SELECT COUNT(*) FROM public.invoices i WHERE i.dealership_id = d.id AND i.invoice_type = 'sale')::bigint as total_sales,
    (SELECT COALESCE(SUM(total_amount), 0) FROM public.invoices i WHERE i.dealership_id = d.id AND i.invoice_type = 'sale' AND i.status = 'paid') as total_revenue,
    
    -- Inventory stats
    (SELECT COUNT(*) FROM public.vehicles v WHERE v.dealership_id = d.id AND v.status = 'available')::bigint as available_vehicles,
    (SELECT COUNT(*) FROM public.parts p WHERE p.dealership_id = d.id AND p.quantity <= p.reorder_threshold)::bigint as low_stock_parts,
    
    -- Service stats
    (SELECT COUNT(*) FROM public.service_jobs sj WHERE sj.dealership_id = d.id AND sj.status = 'in_progress')::bigint as active_service_jobs,
    
    -- Customer stats
    (SELECT COUNT(*) FROM public.customers c WHERE c.dealership_id = d.id)::bigint as total_customers,
    (SELECT COUNT(*) FROM public.leads l WHERE l.dealership_id = d.id AND l.status = 'new')::bigint as new_leads
    
  FROM public.dealerships d
  WHERE d.id = user_dealership_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_dashboard_stats() TO authenticated;