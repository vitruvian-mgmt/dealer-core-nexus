import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VinDecodeRequest {
  vin: string;
}

interface VinDecodeResponse {
  success: boolean;
  data?: {
    make: string;
    model: string;
    year: number;
    trim?: string;
    body_style?: string;
    engine?: string;
    transmission?: string;
    drivetrain?: string;
    fuel_type?: string;
  };
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

    const { vin }: VinDecodeRequest = await req.json();

    if (!vin || vin.length !== 17) {
      throw new Error('Invalid VIN. VIN must be 17 characters long.');
    }

    // Clean and validate VIN
    const cleanVin = vin.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleanVin.length !== 17) {
      throw new Error('Invalid VIN format');
    }

    // Use NHTSA VIN decoder API (free and reliable)
    const nhtsa_url = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${cleanVin}?format=json`;
    
    console.log(`Decoding VIN: ${cleanVin} using NHTSA API`);
    
    const response = await fetch(nhtsa_url);
    if (!response.ok) {
      throw new Error('Failed to decode VIN from NHTSA API');
    }

    const data = await response.json();
    
    if (!data.Results || data.Results.length === 0) {
      throw new Error('No data found for this VIN');
    }

    // Parse NHTSA response into our format
    const results = data.Results;
    const getValue = (variableName: string) => {
      const item = results.find((r: any) => r.Variable === variableName);
      return item?.Value && item.Value !== 'Not Applicable' ? item.Value : null;
    };

    const decodedData = {
      make: getValue('Make') || '',
      model: getValue('Model') || '',
      year: parseInt(getValue('Model Year')) || new Date().getFullYear(),
      trim: getValue('Trim') || getValue('Series'),
      body_style: getValue('Body Class'),
      engine: getValue('Engine Model') || getValue('Engine Configuration'),
      transmission: getValue('Transmission Style'),
      drivetrain: getValue('Drive Type'),
      fuel_type: getValue('Fuel Type - Primary'),
    };

    // Clean up null values
    Object.keys(decodedData).forEach(key => {
      if (decodedData[key as keyof typeof decodedData] === null || 
          decodedData[key as keyof typeof decodedData] === '') {
        delete decodedData[key as keyof typeof decodedData];
      }
    });

    console.log(`Successfully decoded VIN: ${cleanVin}`, decodedData);

    const response_data: VinDecodeResponse = {
      success: true,
      data: decodedData
    };

    return new Response(JSON.stringify(response_data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in decode-vin function:', error);
    
    const errorResponse: VinDecodeResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});