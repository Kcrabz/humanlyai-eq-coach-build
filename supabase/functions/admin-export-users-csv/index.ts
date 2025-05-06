
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log("CSV export function called");
    
    // Parse request body if available
    let filters = {};
    try {
      const requestBody = await req.text();
      if (requestBody) {
        const jsonBody = JSON.parse(requestBody);
        filters = jsonBody.filters || {};
        console.log("Received filters:", filters);
      }
    } catch (e) {
      console.log("No request body or invalid JSON:", e);
    }
    
    // Create Supabase client with admin privileges
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
    
    // Verify the request is from an admin user
    console.log("Verifying user authentication");
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser();
    
    if (authError || !user) {
      console.error("Authentication error:", authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized access', details: authError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if the user has admin access using the is_admin function
    console.log("Checking admin privileges for user:", user.email);
    const { data: isAdmin, error: adminCheckError } = await supabaseAdmin.rpc('is_admin');
    
    if (adminCheckError) {
      console.error("Admin check error:", adminCheckError);
      return new Response(
        JSON.stringify({ error: 'Error checking admin status', details: adminCheckError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!isAdmin) {
      console.error("User is not an admin:", user.email);
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("User is admin, proceeding with data gathering");
    
    try {
      // Get all users from auth.users - this requires admin privileges
      const { data: authUsers, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (authUsersError) {
        console.error("Error fetching users:", authUsersError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch users', details: authUsersError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (!authUsers || !authUsers.users || authUsers.users.length === 0) {
        console.error("No users found or empty users array");
        return new Response(
          JSON.stringify({ error: 'No users found in the system' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log(`Found ${authUsers.users.length} users`);
      
      // Get all profiles from profiles table
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch user profiles', details: profilesError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log(`Found ${profiles?.length || 0} profiles`);
      
      // Get usage data from usage_logs table, aggregated by user
      const { data: usageLogs, error: usageError } = await supabaseAdmin
        .from('usage_logs')
        .select('user_id, token_count');
      
      if (usageError) {
        console.error("Error fetching usage logs:", usageError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch usage data', details: usageError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log(`Found ${usageLogs?.length || 0} usage logs`);
      
      // Calculate total token usage per user
      const userUsage = (usageLogs || []).reduce((acc, log) => {
        if (!acc[log.user_id]) {
          acc[log.user_id] = 0;
        }
        acc[log.user_id] += log.token_count;
        return acc;
      }, {} as Record<string, number>);
      
      // Combine the data
      const combinedData = authUsers.users.map(authUser => {
        const profile = profiles?.find(p => p.id === authUser.id) || {};
        const totalTokens = userUsage[authUser.id] || 0;
        
        return {
          id: authUser.id,
          email: authUser.email,
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          subscription_tier: profile.subscription_tier || 'free',
          eq_archetype: profile.eq_archetype || 'Not set',
          onboarded: profile.onboarded ? 'Yes' : 'No',
          created_at: authUser.created_at,
          total_tokens_used: totalTokens
        };
      });
      
      console.log("Combined data prepared, generating CSV");
      
      // Convert to CSV
      const headers = [
        'Email',
        'First Name',
        'Last Name',
        'Subscription Tier',
        'EQ Archetype',
        'Onboarded',
        'Created At',
        'Total Tokens Used'
      ];
      
      const csv = [
        headers.join(','),
        ...combinedData.map(user => [
          `"${user.email || ''}"`,
          `"${user.first_name || ''}"`,
          `"${user.last_name || ''}"`,
          `"${user.subscription_tier || ''}"`,
          `"${user.eq_archetype || ''}"`,
          `"${user.onboarded || ''}"`,
          `"${user.created_at || ''}"`,
          user.total_tokens_used
        ].join(','))
      ].join('\n');
      
      console.log("CSV generated successfully, returning response");
      
      // Return the CSV file
      return new Response(csv, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="users_export.csv"'
        }
      });
    } catch (error) {
      console.error("Error in data processing:", error);
      return new Response(
        JSON.stringify({ error: 'Error processing data', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
});
