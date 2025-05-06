
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import { corsHeaders } from "./cors.ts";
import { verifyAdmin } from "./auth.ts";
import { getUsersData } from "./data.ts";
import { convertToCsv } from "./csv.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Please use POST.' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  try {
    console.log("CSV export function called");
    
    // Parse request body if available
    let filters = {};
    let debug = false;
    try {
      const requestBody = await req.json();
      filters = requestBody.filters || {};
      debug = Boolean(requestBody.debug);
      console.log("Received filters:", filters);
      if (debug) {
        console.log("Debug mode enabled, will provide detailed logs");
      }
    } catch (e) {
      console.log("Error parsing request body:", e);
      return new Response(
        JSON.stringify({ error: 'Invalid request body. Expected JSON.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ error: 'Server misconfiguration - missing environment variables' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create admin client
    console.log("Creating admin client with service role");
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: { Authorization: authHeader },
      },
    });
    
    // Verify admin access
    const { user, error: authError } = await verifyAdmin(supabaseAdmin);
    
    if (authError) {
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: authError.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    try {
      // Get all user data
      const { data, error } = await getUsersData(supabaseAdmin);
      
      if (error) {
        console.error("Error fetching data:", error);
        return new Response(
          JSON.stringify({ error: error.message, details: error.details }),
          { status: error.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Convert data to CSV
      const csv = convertToCsv(data);
      
      console.log("CSV generated successfully, returning response");
      
      // Return the CSV file with proper headers
      return new Response(csv, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="users_export.csv"'
        }
      });
    } catch (error: any) {
      console.error("Error in data processing:", error);
      return new Response(
        JSON.stringify({ error: 'Error processing data', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: any) {
    console.error("Unexpected error:", error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
