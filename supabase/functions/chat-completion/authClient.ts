
// Import from URL for Deno Edge Functions
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

// Create a Supabase client with the URL and key from environment variables
export function createSupabaseClient(req: Request) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  
  const authHeader = req.headers.get('Authorization') || '';
  
  return createClient(
    supabaseUrl,
    supabaseServiceKey,
    {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    }
  );
}

// Get authenticated user from request
export async function getAuthenticatedUser(supabaseClient: any) {
  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser();
  
  if (error || !user) {
    throw { 
      type: 'auth_error',
      message: error?.message || "User is not authenticated",
      status: 401 
    };
  }
  
  return user;
}

// Get OpenAI API key
export async function getOpenAIApiKey(supabaseClient: any, userId: string) {
  console.log(`Getting API key for user: ${userId}`);
  
  // First check if the user has their own API key
  const { data: userKey, error: userKeyError } = await supabaseClient
    .from('user_api_keys')
    .select('openai_api_key')
    .eq('user_id', userId)
    .single();
    
  if (!userKeyError && userKey?.openai_api_key) {
    return userKey.openai_api_key;
  }
  
  // If no user key, use environment key
  const envKey = Deno.env.get('OPENAI_API_KEY');
  if (!envKey) {
    throw new Error('OpenAI API key not found');
  }
  
  console.log("Using environment API key");
  return envKey;
}

// Get user profile and usage data
export async function getUserProfileAndUsage(supabaseClient: any, userId: string) {
  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('eq_archetype, coaching_mode, subscription_tier, created_at')
      .eq('id', userId)
      .single();
      
    if (profileError || !profile) {
      console.log(`No profile found for user ${userId}. Creating default profile...`);
      
      // Try to create a default profile if none exists
      try {
        const now = new Date().toISOString();
        await supabaseClient
          .from('profiles')
          .insert({
            id: userId,
            eq_archetype: 'Not set',
            coaching_mode: 'normal',
            subscription_tier: 'free',
            onboarded: true,
            created_at: now
          });
      } catch (createError) {
        console.error(`Error creating default profile: ${createError.message || createError}`);
      }
    }
    
    // Get current usage data
    const currentDate = new Date();
    const monthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    const { data: usageData } = await supabaseClient
      .from('usage_logs')
      .select('token_count')
      .eq('user_id', userId)
      .eq('month_year', monthYear)
      .maybeSingle();
      
    const currentUsage = usageData?.token_count || 0;
    
    console.log(`Current usage: ${currentUsage} tokens for ${monthYear}`);
    
    // If we don't have creation date, try to get it from auth.users
    let createdAt = profile?.created_at;
    if (!createdAt) {
      try {
        // Try to get user creation date from auth
        const { data: authUser } = await supabaseClient.auth.admin.getUserById(userId);
        if (authUser?.user?.created_at) {
          createdAt = authUser.user.created_at;
        }
      } catch (authError) {
        console.error("Error getting user creation date:", authError);
      }
    }
    
    // Use profile if it exists, otherwise use defaults
    const result = {
      archetype: profile?.eq_archetype || 'Not set',
      coachingMode: profile?.coaching_mode || 'normal',
      subscriptionTier: profile?.subscription_tier || 'free',
      createdAt: createdAt || null,
      currentUsage,
      monthYear
    };
    
    console.log(`User profile info - Archetype: ${result.archetype}, Mode: ${result.coachingMode}, Tier: ${result.subscriptionTier}`);
    if (result.createdAt) {
      const hoursSinceCreation = (new Date().getTime() - new Date(result.createdAt).getTime()) / (1000 * 60 * 60);
      console.log(`Account age: ${hoursSinceCreation.toFixed(1)} hours`);
    }
    
    return result;
  } catch (error) {
    console.error(`Error getting user profile: ${error.message || error}`);
    
    // Return defaults if anything goes wrong
    return {
      archetype: 'Not set',
      coachingMode: 'normal',
      subscriptionTier: 'free',
      createdAt: null,
      currentUsage: 0,
      monthYear: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
    };
  }
}
