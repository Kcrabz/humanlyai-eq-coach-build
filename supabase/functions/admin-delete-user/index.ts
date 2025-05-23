
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ error: 'Server misconfiguration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create a client with the service role key for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create a client with the user's auth token to verify admin status
    const authClient = createClient(
      supabaseUrl, 
      supabaseServiceKey,
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization') || '' },
        },
      }
    );
    
    // Verify the request is from an admin user
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();
    
    if (authError || !user) {
      console.error("Authentication error:", authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if the user has admin access
    const { data: isAdmin, error: adminCheckError } = await authClient.rpc('is_admin');
    
    if (adminCheckError || !isAdmin) {
      console.error("Admin check error:", adminCheckError);
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get the user ID from the request
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check that user is not deleting themselves
    if (userId === user.id) {
      return new Response(
        JSON.stringify({ error: 'Cannot delete your own admin account' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Admin user ${user.email} deleting user ${userId}`);
    
    // First, delete related records in the user_streaks table to avoid foreign key constraint violations
    const { error: streaksDeleteError } = await supabaseAdmin
      .from('user_streaks')
      .delete()
      .eq('user_id', userId);
    
    if (streaksDeleteError) {
      console.error("Error deleting user streaks:", streaksDeleteError);
      // Continue with deletion even if this fails - it may not exist
    }
    
    // Delete other related records as needed
    const tables = [
      'user_engagement_metrics',
      'email_preferences',
      'user_login_history',
      'user_archived_memories',
      'chat_logs',
      'chat_messages',
      'usage_logs',
      'user_api_keys',
      'user_achievements',
      'eq_breakthroughs',
      'profiles'
    ];
    
    // Delete data from related tables sequentially
    for (const table of tables) {
      const { error: tableDeleteError } = await supabaseAdmin
        .from(table)
        .delete()
        .eq('user_id', userId);
      
      if (tableDeleteError) {
        console.log(`Note: Could not delete from ${table}:`, tableDeleteError);
        // Continue with other deletions even if one table fails - it may not exist or have records
      }
    }
    
    // Finally delete the user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      return new Response(
        JSON.stringify({ error: deleteError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User deleted successfully',
        data: { userId }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error("Unexpected error:", error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
