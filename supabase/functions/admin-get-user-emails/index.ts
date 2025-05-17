
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache user emails in memory to reduce database queries
const emailCache = new Map<string, {email: string, timestamp: number}>();
const CACHE_TTL = 60 * 1000; // 60 seconds cache TTL

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
    
    // Create service client for admin operations
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create auth client with the user's auth token
    const authClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization') || '' },
      },
    });
    
    // Verify the requesting user is an admin
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

    // Parse the request body to get userIds
    const { userIds } = await req.json();
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: userIds array required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Filter out ids we already have in cache (that haven't expired)
    const now = Date.now();
    const uncachedIds = userIds.filter(id => {
      const cachedItem = emailCache.get(id);
      return !cachedItem || (now - cachedItem.timestamp > CACHE_TTL);
    });
    
    let users = [];
    
    // If we have uncached IDs, fetch them
    if (uncachedIds.length > 0) {
      console.log(`Fetching ${uncachedIds.length} uncached user emails`);
      const { data: authUsers, error: usersError } = await serviceClient.auth.admin.listUsers();
      
      if (usersError) {
        console.error("Error fetching users:", usersError);
        return new Response(
          JSON.stringify({ error: usersError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Update cache with fresh data
      authUsers.users.forEach(user => {
        emailCache.set(user.id, {
          email: user.email || 'Unknown',
          timestamp: now
        });
      });
    } else {
      console.log('All requested user emails found in cache');
    }
    
    // Return the combined data from cache
    const result = userIds.map(id => {
      const cachedItem = emailCache.get(id);
      return {
        id,
        email: cachedItem ? cachedItem.email : 'Unknown'
      };
    });
    
    return new Response(
      JSON.stringify(result),
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
