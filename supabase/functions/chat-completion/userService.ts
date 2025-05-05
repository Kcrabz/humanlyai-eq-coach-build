import { createSupabaseClient, getAuthenticatedUser, getUserProfileAndUsage, getOpenAIApiKey } from "./authClient.ts";
import { checkUsageLimit } from "./usageTracking.ts";
import { retrieveChatHistory } from "./handlerUtils.ts";

// Get user data and prepare for chat request
export async function prepareUserData(req: Request, reqBody: any) {
  const supabaseClient = createSupabaseClient(req);
  
  // Get authenticated user
  const user = await getAuthenticatedUser(supabaseClient);
  console.log(`Processing chat request for user: ${user.id}`);
  
  // Extract client-provided values
  const { 
    subscriptionTier: clientSubscriptionTier,
    archetype: clientArchetype,
    coachingMode: clientCoachingMode 
  } = reqBody;
  
  // Get OpenAI API key
  const openAiApiKey = await getOpenAIApiKey(supabaseClient, user.id);
  
  // Get user profile and usage data
  const { 
    archetype, 
    coachingMode, 
    subscriptionTier, 
    currentUsage, 
    monthYear 
  } = await getUserProfileAndUsage(supabaseClient, user.id);
  
  // Use client-provided values as fallbacks if available
  const effectiveArchetype = archetype || clientArchetype || 'unknown';
  const effectiveCoachingMode = coachingMode || clientCoachingMode || 'normal';
  const effectiveSubscriptionTier = subscriptionTier || clientSubscriptionTier || 'free';
  
  console.log(`User settings: archetype=${effectiveArchetype}, coachingMode=${effectiveCoachingMode}, tier=${effectiveSubscriptionTier}`);
  
  // Check usage limits
  const tierLimit = checkUsageLimit(currentUsage, effectiveSubscriptionTier);
  
  return {
    supabaseClient,
    user,
    openAiApiKey,
    effectiveArchetype,
    effectiveCoachingMode,
    effectiveSubscriptionTier,
    currentUsage,
    tierLimit,
    monthYear
  };
}

// Get chat history based on subscription tier
export async function getChatHistory(supabaseClient: any, userId: string, subscriptionTier: string, clientProvidedHistory: any[] = []) {
  let chatHistory = [];
  
  if (subscriptionTier === 'premium') {
    // For premium users, get history from database
    chatHistory = await retrieveChatHistory(supabaseClient, userId, 5);
  } else if (clientProvidedHistory.length > 0) {
    // For non-premium users, use the client-provided history
    // Filter out system messages and keep only recent history
    chatHistory = clientProvidedHistory
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .slice(0, subscriptionTier === 'basic' ? 8 : 4); // Basic: 4 exchanges, Free: 2 exchanges
    
    console.log(`Using ${chatHistory.length} messages from client-provided history for ${subscriptionTier} user`);
  }
  
  return chatHistory;
}
