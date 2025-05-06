
import { supabase } from "@/integrations/supabase/client";
import { UserStreakData, UserAchievement } from "@/types/auth";

export const fetchUserStreakData = async (userId: string): Promise<UserStreakData | null> => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_streak', { user_id_param: userId });
    
    if (error) throw error;
    
    if (data) {
      // Handle data as a single object since that's what our RPC returns
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
    const { data, error } = await supabase
      .rpc('get_user_achievements', { user_id_param: userId });
    
    if (error) throw error;
    
    if (data && Array.isArray(data)) {
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
