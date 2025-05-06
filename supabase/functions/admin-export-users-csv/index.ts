
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
    // Create Supabase client with admin privileges
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ error: 'Server misconfiguration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization') || '' },
      },
    });
    
    // Verify the request is from an admin user
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser();
    
    if (authError || !user) {
      console.error("Authentication error:", authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if the user has admin access using the is_admin function
    const { data: isAdmin, error: adminCheckError } = await supabaseAdmin.rpc('is_admin');
    
    if (adminCheckError || !isAdmin) {
      console.error("Admin check error:", adminCheckError);
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get all users from auth.users - this requires admin privileges
    const { data: authUsers, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authUsersError) {
      console.error("Error fetching users:", authUsersError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch users' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get all profiles from profiles table
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user profiles' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get usage data from usage_logs table, aggregated by user
    const { data: usageLogs, error: usageError } = await supabaseAdmin
      .from('usage_logs')
      .select('user_id, token_count');
    
    if (usageError) {
      console.error("Error fetching usage logs:", usageError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch usage data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Calculate total token usage per user
    const userUsage = usageLogs.reduce((acc, log) => {
      if (!acc[log.user_id]) {
        acc[log.user_id] = 0;
      }
      acc[log.user_id] += log.token_count;
      return acc;
    }, {});
    
    // Combine the data
    const combinedData = authUsers.users.map(authUser => {
      const profile = profiles.find(p => p.id === authUser.id) || {};
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
    console.error("Unexpected error:", error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
});
