
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
    coachingMode: clientCoachingMode,
    userId: clientUserId,
    primaryTopic: clientPrimaryTopic // Accept primary topic from client
  } = reqBody;
  
  // Get OpenAI API key
  const openAiApiKey = await getOpenAIApiKey(supabaseClient, user.id);
  
  // Get user profile and usage data
  const { 
    archetype, 
    coachingMode, 
    subscriptionTier,
    createdAt,
    currentUsage, 
    monthYear 
  } = await getUserProfileAndUsage(supabaseClient, user.id);
  
  // Determine if user is still in trial period (first 24 hours)
  let effectiveSubscriptionTier = subscriptionTier || clientSubscriptionTier || 'free';
  
  // If account was created less than 24 hours ago, consider them in trial
  if (createdAt) {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const hoursSinceCreation = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceCreation <= 24) {
      console.log(`User in trial period: ${hoursSinceCreation.toFixed(1)} hours since creation`);
      effectiveSubscriptionTier = 'trial';
    }
  }
  
  // Use client-provided values as fallbacks if available
  const effectiveArchetype = archetype || clientArchetype || 'unknown';
  const effectiveCoachingMode = coachingMode || clientCoachingMode || 'normal';
  const effectivePrimaryTopic = clientPrimaryTopic || undefined;
  
  console.log(`User settings: archetype=${effectiveArchetype}, coachingMode=${effectiveCoachingMode}, tier=${effectiveSubscriptionTier}`);
  if (effectivePrimaryTopic) {
    console.log(`Primary conversation topic: ${effectivePrimaryTopic}`);
  }
  
  // Check usage limits - import from usageTracking.ts
  const tierLimit = checkUsageLimit(currentUsage, effectiveSubscriptionTier);
  
  return {
    supabaseClient,
    user,
    openAiApiKey,
    effectiveArchetype,
    effectiveCoachingMode,
    effectiveSubscriptionTier,
    effectivePrimaryTopic,
    currentUsage,
    tierLimit,
    monthYear
  };
}

// Get chat history based on subscription tier
export async function getChatHistory(supabaseClient: any, userId: string, subscriptionTier: string, clientProvidedHistory: any[] = []) {
  let chatHistory = [];
  
  // For trial users, treat them like premium for history access
  const effectiveTier = subscriptionTier === 'trial' ? 'premium' : subscriptionTier;
  
  if (effectiveTier === 'premium') {
    // For premium users, get history from database
    chatHistory = await retrieveChatHistory(supabaseClient, userId, 5);
  } else if (clientProvidedHistory.length > 0) {
    // For non-premium users, use the client-provided history
    // Filter out system messages and keep only recent history
    chatHistory = clientProvidedHistory
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .slice(0, effectiveTier === 'basic' ? 8 : 4); // Basic: 4 exchanges, Free: 2 exchanges
    
    console.log(`Using ${chatHistory.length} messages from client-provided history for ${effectiveTier} user`);
  }
  
  return chatHistory;
}
