
import { supabase } from "@/integrations/supabase/client";
import { UserStreakData, UserAchievement } from "@/types/auth";

export const fetchUserStreakData = async (userId: string): Promise<UserStreakData | null> => {
  try {
    // Using a direct query instead of RPC since RPC is not working correctly
    const { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    
    if (data) {
      return {
        currentStreak: data.current_streak || 0,
        longestStreak: data.longest_streak || 0,
        lastActiveDate: data.last_active_date,
        totalActiveDays: data.total_active_days || 0
      };
    }
    
    return null;
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
