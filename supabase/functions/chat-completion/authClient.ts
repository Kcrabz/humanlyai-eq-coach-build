
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "./utils.ts";

// Create Supabase client with auth context
export function createSupabaseClient(req: Request) {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { 
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
      auth: { persistSession: false }
    }
  );
}

// Helper function to get authenticated user
export async function getAuthenticatedUser(supabaseClient: any) {
  const { data: { user }, error } = await supabaseClient.auth.getUser();
  
  if (error || !user) {
    console.error("Authentication error:", error?.message || "No user found");
    throw new Error('Unauthorized');
  }
  
  return user;
}

// Get the API key to use (user's personal or environment)
export async function getOpenAIApiKey(supabaseClient: any, userId: string) {
  console.log(`Getting API key for user: ${userId}`);
  
  // Try to get user's API key first
  const { data: userApiKey, error: userApiKeyError } = await supabaseClient
    .from('user_api_keys')
    .select('openai_api_key')
    .eq('user_id', userId)
    .maybeSingle();
  
  // Use the user's API key if available, otherwise use the environment variable
  let openAiApiKey = userApiKey?.openai_api_key;
  
  // If no user API key, fall back to environment variable
  if (!openAiApiKey) {
    openAiApiKey = Deno.env.get('OPENAI_API_KEY');
    console.log("Using environment API key");
  } else {
    console.log("Using user's personal API key");
  }
  
  if (!openAiApiKey) {
    throw new Error('API key not configured. Please check your account settings or contact the administrator.');
  }
  
  return openAiApiKey;
}

// Get user's subscription tier and usage data
export async function getUserProfileAndUsage(supabaseClient: any, userId: string) {
  // Get current month-year for usage tracking
  const today = new Date();
  const monthYear = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  // Check if profile exists for the user
  const { data: profileData, error: profileError } = await supabaseClient
    .from('profiles')
    .select('subscription_tier, eq_archetype, coaching_mode')
    .eq('id', userId)
    .maybeSingle();
  
  if (profileError) {
    console.error("Error fetching profile:", profileError.message);
  }
  
  // If profile doesn't exist, create it with default values
  if (!profileData) {
    console.log(`No profile found for user ${userId}. Creating default profile...`);
    try {
      // Insert default profile - using upsert to avoid duplicates
      const { error: insertError } = await supabaseClient
        .from('profiles')
        .upsert({
          id: userId,
          subscription_tier: 'free',
          eq_archetype: 'Not set',
          coaching_mode: 'normal',
          onboarded: false
        }, {
          onConflict: 'id'  // Use id as conflict detection
        });
      
      if (insertError) {
        console.error("Error creating default profile:", insertError.message);
      } else {
        console.log("Default profile created successfully");
      }
    } catch (err) {
      console.error("Exception creating default profile:", err);
    }
  }
  
  // Get user's current month usage
  const { data: usageData, error: usageError } = await supabaseClient
    .from('usage_logs')
    .select('token_count')
    .eq('user_id', userId)
    .eq('month_year', monthYear)
    .maybeSingle();

  if (usageError) {
    console.error("Error fetching usage data:", usageError.message);
  }

  // Set default values if no data found
  const archetype = profileData?.eq_archetype || "Not set";
  const coachingMode = profileData?.coaching_mode || "normal";
  const subscriptionTier = profileData?.subscription_tier || "free";
  const currentUsage = usageData?.token_count || 0;

  console.log(`User profile info - Archetype: ${archetype}, Mode: ${coachingMode}, Tier: ${subscriptionTier}`);
  console.log(`Current usage: ${currentUsage} tokens for ${monthYear}`);

  return {
    archetype,
    coachingMode,
    subscriptionTier,
    currentUsage,
    monthYear
  };
}
