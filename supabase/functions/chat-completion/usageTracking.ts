
import { supabaseClient } from "./authClient.ts";
import { corsHeaders } from "./utils.ts";

// Define tier limits locally if they're not available in utils.ts
const TIER_LIMITS = {
  free: 500,
  premium: 10000
};

// Update usage tracking
export async function updateUsageTracking(
  supabase: any, 
  userId: string, 
  monthYear: string, 
  tokensUsed: number
) {
  try {
    // Log usage
    const { data: usageData, error: usageError } = await supabase
      .from('usage_logs')
      .insert({
        user_id: userId,
        month_year: monthYear,
        tokens_used: tokensUsed,
        service: 'chat'
      })
      .select('id');
    
    if (usageError) {
      console.error("Error logging usage:", usageError);
    }
    
    // Update user streaks if premium user
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();
    
    if (!userError && userData && userData.subscription_tier === 'premium') {
      updateUserStreak(supabase, userId);
    }
    
    return usageData;
  } catch (error) {
    console.error("Error in usage tracking:", error);
    return null;
  }
}

// Update user streak data
async function updateUserStreak(supabase: any, userId: string) {
  try {
    // Get today's date in UTC
    const today = new Date().toISOString().split('T')[0];
    
    // Check if user already has a streak record
    const { data: streakData, error: streakError } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (streakError) {
      console.error("Error getting user streak:", streakError);
      return;
    }
    
    if (!streakData) {
      // Create new streak record if it doesn't exist
      await supabase
        .from('user_streaks')
        .insert({
          user_id: userId,
          current_streak: 1,
          longest_streak: 1,
          last_active_date: today,
          total_active_days: 1
        });
    } else {
      // Determine if we should update the streak
      const lastActiveDate = streakData.last_active_date;
      
      if (lastActiveDate === today) {
        // Already tracked today, don't increment
        return;
      }
      
      // Calculate date difference
      const lastActive = new Date(lastActiveDate);
      const currentDate = new Date(today);
      const timeDiff = currentDate.getTime() - lastActive.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
      
      let newStreak = streakData.current_streak;
      
      if (daysDiff === 1) {
        // Consecutive day, increment streak
        newStreak += 1;
      } else if (daysDiff > 1) {
        // Streak broken, reset to 1
        newStreak = 1;
      }
      
      // Update streak record
      await supabase
        .from('user_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, streakData.longest_streak || 0),
          last_active_date: today,
          total_active_days: (streakData.total_active_days || 0) + 1
        })
        .eq('user_id', userId);
    }
  } catch (error) {
    console.error("Error updating user streak:", error);
  }
}

// Log chat messages for premium users
export async function logChatMessages(
  supabase: any, 
  userId: string, 
  userMessage: string, 
  assistantMessage: string,
  inputTokens: number,
  outputTokens: number
) {
  try {
    // Log user message
    await supabase
      .from('chat_logs')
      .insert({
        user_id: userId,
        content: userMessage,
        role: 'user',
        token_count: inputTokens
      });
    
    // Log assistant message
    await supabase
      .from('chat_logs')
      .insert({
        user_id: userId,
        content: assistantMessage,
        role: 'assistant',
        token_count: outputTokens
      });
    
    return true;
  } catch (error) {
    console.error("Error logging chat messages:", error);
    return false;
  }
}
