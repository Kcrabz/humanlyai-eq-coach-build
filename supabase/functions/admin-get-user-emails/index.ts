
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced cache with longer TTL and better deduplication
const emailCache = new Map<string, {email: string, timestamp: number}>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL
const BATCH_SIZE = 50; // Process userIds in batches for better performance

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
    let userIds: string[] = [];
    try {
      const requestData = await req.json();
      userIds = requestData?.userIds || [];
    } catch (parseError) {
      // If no userIds provided, return empty array
      return new Response(
        JSON.stringify([]),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Deduplicate user IDs to avoid fetching the same user multiple times
    userIds = Array.from(new Set(userIds));
    
    if (userIds.length === 0) {
      return new Response(
        JSON.stringify([]),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Filter out ids we already have in cache (that haven't expired)
    const now = Date.now();
    const uncachedIds = userIds.filter(id => {
      const cachedItem = emailCache.get(id);
      return !cachedItem || (now - cachedItem.timestamp > CACHE_TTL);
    });
    
    // If we have uncached IDs, fetch them
    if (uncachedIds.length > 0) {
      console.log(`Fetching ${uncachedIds.length} uncached user emails`);
      
      try {
        // Fetch users in batches to avoid overloading the database
        const emailLookup = new Map();
        
        // Get all users in one query
        const { data: authUsers, error: usersError } = await serviceClient.auth.admin.listUsers();
        
        if (usersError) {
          console.error("Error fetching users:", usersError);
          
          // Still return cached results even if we hit an error for new users
          const result = userIds.map(id => {
            const cachedItem = emailCache.get(id);
            return {
              id,
              email: cachedItem ? cachedItem.email : 'Unknown'
            };
          });
          
          return new Response(
            JSON.stringify(result),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Create a map for faster lookups
        authUsers?.users?.forEach(user => {
          if (user && user.id && user.email) {
            emailLookup.set(user.id, user.email);
            
            // Update cache with fresh data
            emailCache.set(user.id, {
              email: user.email,
              timestamp: now
            });
          }
        });
      } catch (fetchError) {
        console.error("Error fetching auth users:", fetchError);
      }
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
