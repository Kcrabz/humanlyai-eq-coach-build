
import { supabase } from "@/integrations/supabase/client";
import { UserStreakData, UserAchievement } from "@/types/auth";

export const fetchUserStreakData = async (userId: string): Promise<UserStreakData | null> => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_streak', { user_id_param: userId });
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      const streakData = data[0];
      return {
        currentStreak: streakData.current_streak || 0,
        longestStreak: streakData.longest_streak || 0,
        lastActiveDate: streakData.last_active_date,
        totalActiveDays: streakData.total_active_days || 0
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
    const { data, error } = await supabase
      .rpc('get_user_achievements', { user_id_param: userId });
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      return data.map(item => ({
        id: item.achievement_id,
        title: item.title,
        description: item.description,
        achieved: item.achieved,
        achievedAt: item.achieved_at,
        type: item.type,
        icon: item.icon
      }));
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching user achievements:", error);
    return null;
  }
};
