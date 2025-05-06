
import { supabase } from "@/integrations/supabase/client";

export const useBasicStats = () => {
  const fetchBasicStats = async () => {
    try {
      // Get total users count
      const { count: totalUsers, error: totalError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Get onboarded users count
      const { count: onboardedUsers, error: onboardedError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('onboarded', true);

      if (onboardedError) throw onboardedError;

      // Get chat users count (users with chat messages)
      const { count: chatUsers, error: chatError } = await supabase
        .from('chat_messages')
        .select('user_id', { count: 'exact', head: true })
        .not('user_id', 'is', null);

      if (chatError) throw chatError;

      return {
        totalUsers: totalUsers || 0,
        onboardedUsers: onboardedUsers || 0,
        chatUsers: chatUsers || 0
      };
    } catch (error) {
      console.error("Error fetching basic stats:", error);
      return {
        totalUsers: 0,
        onboardedUsers: 0,
        chatUsers: 0
      };
    }
  };

  return { fetchBasicStats };
};
