
import { supabase } from "@/integrations/supabase/client";
import { UserStreakData, UserAchievement } from "@/types/auth";

export const fetchUserStreakData = async (userId: string): Promise<UserStreakData | null> => {
  try {
    // Query user_streaks table directly
    const { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching user streak data:", error);
      return null;
    }
    
    // If no data, try to initialize streak data
    if (!data) {
      try {
        // Initialize user streak by calling the increment-streak function
        const { data: streakResponse } = await supabase.functions.invoke('increment-streak', {
          body: { user_id: userId }
        });
        
        if (streakResponse?.streak) {
          return {
            currentStreak: streakResponse.streak.current_streak || 1,
            longestStreak: streakResponse.streak.longest_streak || 1,
            lastActiveDate: streakResponse.streak.last_active_date,
            totalActiveDays: streakResponse.streak.total_active_days || 1
          };
        }
      } catch (initError) {
        console.error("Error initializing user streak:", initError);
      }
      return null;
    }
    
    // Return formatted streak data
    return {
      currentStreak: data.current_streak || 0,
      longestStreak: data.longest_streak || 0,
      lastActiveDate: data.last_active_date,
      totalActiveDays: data.total_active_days || 0
    };
  } catch (error) {
    console.error("Error fetching user streak data:", error);
    return null;
  }
};

export const fetchUserAchievements = async (userId: string): Promise<UserAchievement[] | null> => {
  try {
    // Using a direct join query instead of RPC
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        id,
        achieved,
        achieved_at,
        achievements (
          id,
          title,
          description,
          type,
          icon
        )
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    if (data && Array.isArray(data)) {
      return data.map(item => {
        // Make sure type is cast to the expected union type
        const achievementType = item.achievements.type as "streak" | "breakthrough" | "milestone" | "challenge";
        
        return {
          id: item.id,
          title: item.achievements.title,
          description: item.achievements.description,
          achieved: item.achieved,
          achievedAt: item.achieved_at,
          type: achievementType,
          icon: item.achievements.icon
        };
      });
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching user achievements:", error);
    return null;
  }
};
