
// Check if user has exceeded their monthly token limit
import { TIER_LIMITS } from "./utils.ts";

export function checkUsageLimit(currentUsage: number, subscriptionTier: string) {
  const tierLimit = TIER_LIMITS[subscriptionTier as keyof typeof TIER_LIMITS] || TIER_LIMITS.free;
  
  if (currentUsage >= tierLimit) {
    throw {
      type: 'usage_limit',
      message: `You've reached your monthly token limit (${tierLimit} tokens). Please upgrade your plan to continue.`,
      currentUsage,
      tierLimit
    };
  }
  
  return tierLimit;
}

// Update usage tracking in the database
export async function updateUsageTracking(supabaseClient: any, userId: string, monthYear: string, tokenCount: number) {
  try {
    // Try to update existing record
    const { data, error } = await supabaseClient
      .from('usage_logs')
      .select('id, token_count')
      .eq('user_id', userId)
      .eq('month_year', monthYear)
      .maybeSingle();
      
    if (error) {
      console.error("Error fetching usage:", error);
      return;
    }
    
    if (data) {
      // Update existing record
      await supabaseClient
        .from('usage_logs')
        .update({ 
          token_count: data.token_count + tokenCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id);
    } else {
      // Insert new record
      await supabaseClient
        .from('usage_logs')
        .insert({
          user_id: userId,
          month_year: monthYear,
          token_count: tokenCount
        });
    }
  } catch (error) {
    console.error("Error updating usage tracking:", error);
  }
}

// Log chat messages for premium users
export async function logChatMessages(supabaseClient: any, userId: string, userMessage: string, assistantResponse: string, estimatedInputTokens: number, estimatedOutputTokens: number) {
  try {
    // Log user message
    await supabaseClient
      .from('chat_logs')
      .insert({
        user_id: userId,
        content: userMessage,
        role: 'user',
        token_count: estimatedInputTokens
      });
      
    // Log assistant response
    await supabaseClient
      .from('chat_logs')
      .insert({
        user_id: userId,
        content: assistantResponse,
        role: 'assistant',
        token_count: estimatedOutputTokens
      });
  } catch (error) {
    console.error("Error logging chat messages:", error);
  }
}
