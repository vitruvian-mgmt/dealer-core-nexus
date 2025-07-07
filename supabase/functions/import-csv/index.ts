import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImportRequest {
  data: any[];
  type: 'vehicles' | 'customers' | 'parts';
  options?: {
    skipErrors?: boolean;
    updateExisting?: boolean;
  };
}

interface ImportResponse {
  success: boolean;
  imported: number;
  errors: Array<{
    row: number;
    error: string;
    data?: any;
  }>;
  skipped: number;
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

    // Get user profile and dealership
    const { data: profile } = await supabase
      .from('profiles')
      .select('dealership_id, role_id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      throw new Error('User profile not found');
    }

    const { data, type, options = {} }: ImportRequest = await req.json();

    console.log(`Starting CSV import for ${type}, ${data.length} rows`);

    const results: ImportResponse = {
      success: true,
      imported: 0,
      errors: [],
      skipped: 0
    };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        // Add dealership_id to each row
        const recordData = {
          ...row,
          dealership_id: profile.dealership_id,
          created_by: user.id
        };

        // Validate and process based on type
        switch (type) {
          case 'vehicles':
            await processVehicleRow(supabase, recordData, options);
            break;
          case 'customers':
            await processCustomerRow(supabase, recordData, options);
            break;
          case 'parts':
            await processPartsRow(supabase, recordData, options);
            break;
          default:
            throw new Error(`Unknown import type: ${type}`);
        }

        results.imported++;

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error processing row ${i + 1}:`, errorMessage);
        
        results.errors.push({
          row: i + 1,
          error: errorMessage,
          data: row
        });

        if (!options.skipErrors) {
          break;
        } else {
          results.skipped++;
        }
      }
    }

    console.log(`Import completed: ${results.imported} imported, ${results.errors.length} errors, ${results.skipped} skipped`);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in import-csv function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      imported: 0,
      errors: [{ row: 0, error: error instanceof Error ? error.message : 'Unknown error' }],
      skipped: 0
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processVehicleRow(supabase: any, row: any, options: any) {
  // Validate required fields
  if (!row.vin) {
    throw new Error('VIN is required');
  }

  // Clean VIN
  row.vin = row.vin.toString().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (row.vin.length !== 17) {
    throw new Error('Invalid VIN format');
  }

  // Check if vehicle already exists
  if (options.updateExisting) {
    const { data: existing } = await supabase
      .from('vehicles')
      .select('id')
      .eq('vin', row.vin)
      .eq('dealership_id', row.dealership_id)
      .single();

    if (existing) {
      await supabase
        .from('vehicles')
        .update(row)
        .eq('id', existing.id);
      return;
    }
  }

  // Insert new vehicle
  const { error } = await supabase
    .from('vehicles')
    .insert(row);

  if (error) {
    throw new Error(error.message);
  }
}

async function processCustomerRow(supabase: any, row: any, options: any) {
  // Validate required fields
  if (!row.first_name || !row.last_name) {
    throw new Error('First name and last name are required');
  }

  // Check for existing customer by email if provided
  if (row.email && options.updateExisting) {
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('email', row.email)
      .eq('dealership_id', row.dealership_id)
      .single();

    if (existing) {
      await supabase
        .from('customers')
        .update(row)
        .eq('id', existing.id);
      return;
    }
  }

  // Insert new customer
  const { error } = await supabase
    .from('customers')
    .insert(row);

  if (error) {
    throw new Error(error.message);
  }
}

async function processPartsRow(supabase: any, row: any, options: any) {
  // Validate required fields
  if (!row.part_number || !row.name) {
    throw new Error('Part number and name are required');
  }

  // Check if part already exists
  if (options.updateExisting) {
    const { data: existing } = await supabase
      .from('parts')
      .select('id')
      .eq('part_number', row.part_number)
      .eq('dealership_id', row.dealership_id)
      .single();

    if (existing) {
      await supabase
        .from('parts')
        .update(row)
        .eq('id', existing.id);
      return;
    }
  }

  // Convert numeric fields
  if (row.quantity) row.quantity = parseInt(row.quantity) || 0;
  if (row.reorder_threshold) row.reorder_threshold = parseInt(row.reorder_threshold) || 10;
  if (row.unit_cost) row.unit_cost = parseFloat(row.unit_cost) || 0;
  if (row.sale_price) row.sale_price = parseFloat(row.sale_price) || 0;

  // Insert new part
  const { error } = await supabase
    .from('parts')
    .insert(row);

  if (error) {
    throw new Error(error.message);
  }
}