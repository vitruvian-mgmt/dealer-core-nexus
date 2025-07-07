import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportRequest {
  type: 'sales' | 'inventory' | 'service' | 'financial';
  format: 'csv' | 'pdf' | 'json';
  parameters: {
    startDate?: string;
    endDate?: string;
    includeDetails?: boolean;
    groupBy?: string;
    filters?: Record<string, any>;
  };
  delivery?: {
    method: 'download' | 'email';
    emails?: string[];
  };
}

interface ReportResponse {
  success: boolean;
  reportId?: string;
  downloadUrl?: string;
  data?: any[];
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Get user profile and verify permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select(`
        dealership_id,
        role_id,
        roles (
          permissions
        )
      `)
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      throw new Error('User profile not found');
    }

    // Check if user has reports permission
    const permissions = profile.roles?.permissions || {};
    if (!permissions['reports.view'] && !permissions['reports.create']) {
      throw new Error('Insufficient permissions to generate reports');
    }

    const request: ReportRequest = await req.json();
    
    console.log(`Generating ${request.type} report in ${request.format} format`);

    // Generate report data based on type
    let reportData: any[] = [];
    let reportTitle = '';

    switch (request.type) {
      case 'sales':
        ({ data: reportData, title: reportTitle } = await generateSalesReport(supabase, profile.dealership_id, request.parameters));
        break;
      case 'inventory':
        ({ data: reportData, title: reportTitle } = await generateInventoryReport(supabase, profile.dealership_id, request.parameters));
        break;
      case 'service':
        ({ data: reportData, title: reportTitle } = await generateServiceReport(supabase, profile.dealership_id, request.parameters));
        break;
      case 'financial':
        ({ data: reportData, title: reportTitle } = await generateFinancialReport(supabase, profile.dealership_id, request.parameters));
        break;
      default:
        throw new Error(`Unknown report type: ${request.type}`);
    }

    // Process based on format
    let responseData: any;
    
    if (request.format === 'json') {
      responseData = reportData;
    } else if (request.format === 'csv') {
      responseData = await convertToCSV(reportData);
    } else if (request.format === 'pdf') {
      // For PDF, we'll return the data and let the frontend handle PDF generation
      // In a production system, you might use a PDF library here
      responseData = {
        title: reportTitle,
        data: reportData,
        generatedAt: new Date().toISOString()
      };
    }

    // Log report generation
    await supabase
      .from('audit_logs')
      .insert({
        dealership_id: profile.dealership_id,
        table_name: 'reports',
        action: 'GENERATE',
        new_values: {
          type: request.type,
          format: request.format,
          parameters: request.parameters
        },
        user_id: user.id
      });

    const response: ReportResponse = {
      success: true,
      data: responseData
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in generate-report function:', error);
    
    const errorResponse: ReportResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateSalesReport(supabase: any, dealership_id: string, params: any) {
  const { startDate, endDate } = params;
  
  let query = supabase
    .from('invoices')
    .select(`
      id,
      invoice_number,
      total_amount,
      status,
      issued_at,
      customers (
        first_name,
        last_name,
        email
      ),
      vehicles (
        make,
        model,
        year,
        vin
      )
    `)
    .eq('dealership_id', dealership_id)
    .eq('invoice_type', 'sale')
    .order('issued_at', { ascending: false });

  if (startDate) {
    query = query.gte('issued_at', startDate);
  }
  if (endDate) {
    query = query.lte('issued_at', endDate);
  }

  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Failed to generate sales report: ${error.message}`);
  }

  return {
    data: data || [],
    title: 'Sales Report'
  };
}

async function generateInventoryReport(supabase: any, dealership_id: string, params: any) {
  let query = supabase
    .from('vehicles')
    .select(`
      id,
      vin,
      make,
      model,
      year,
      mileage,
      condition,
      purchase_price,
      sale_price,
      status,
      location,
      date_acquired,
      created_at
    `)
    .eq('dealership_id', dealership_id)
    .order('created_at', { ascending: false });

  if (params.filters?.status) {
    query = query.eq('status', params.filters.status);
  }

  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Failed to generate inventory report: ${error.message}`);
  }

  return {
    data: data || [],
    title: 'Inventory Report'
  };
}

async function generateServiceReport(supabase: any, dealership_id: string, params: any) {
  const { startDate, endDate } = params;
  
  let query = supabase
    .from('service_jobs')
    .select(`
      id,
      job_number,
      service_type,
      status,
      total_amount,
      scheduled_at,
      completed_at,
      customers (
        first_name,
        last_name
      ),
      vehicles (
        make,
        model,
        year,
        vin
      )
    `)
    .eq('dealership_id', dealership_id)
    .order('scheduled_at', { ascending: false });

  if (startDate) {
    query = query.gte('scheduled_at', startDate);
  }
  if (endDate) {
    query = query.lte('scheduled_at', endDate);
  }

  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Failed to generate service report: ${error.message}`);
  }

  return {
    data: data || [],
    title: 'Service Report'
  };
}

async function generateFinancialReport(supabase: any, dealership_id: string, params: any) {
  const { startDate, endDate } = params;
  
  // Get invoices with payments
  let query = supabase
    .from('invoices')
    .select(`
      id,
      invoice_number,
      invoice_type,
      total_amount,
      amount_paid,
      amount_due,
      status,
      issued_at,
      payments (
        amount,
        payment_method,
        payment_date
      )
    `)
    .eq('dealership_id', dealership_id)
    .order('issued_at', { ascending: false });

  if (startDate) {
    query = query.gte('issued_at', startDate);
  }
  if (endDate) {
    query = query.lte('issued_at', endDate);
  }

  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Failed to generate financial report: ${error.message}`);
  }

  return {
    data: data || [],
    title: 'Financial Report'
  };
}

async function convertToCSV(data: any[]): Promise<string> {
  if (!data || data.length === 0) {
    return '';
  }

  // Get all unique keys from all objects
  const allKeys = new Set<string>();
  data.forEach(obj => {
    Object.keys(obj).forEach(key => allKeys.add(key));
  });

  const headers = Array.from(allKeys);
  
  // Create CSV header
  let csv = headers.map(header => `"${header}"`).join(',') + '\n';
  
  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) {
        return '""';
      }
      // Handle nested objects
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csv += values.join(',') + '\n';
  });

  return csv;
}