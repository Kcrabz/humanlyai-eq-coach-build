
import { supabase } from "@/integrations/supabase/client";

export const useChatUserIds = () => {
  // Helper function to fetch users with chat activity
  const fetchUsersWithChatActivity = async (): Promise<string[]> => {
    try {
      const { data: chatData, error: chatError } = await supabase
        .from('chat_messages')
        .select('user_id')
        .not('user_id', 'is', null);

      if (chatError) throw chatError;

      // Get unique user IDs
      const userIds = [...new Set(chatData.map(item => item.user_id))];
      return userIds;
    } catch (error) {
      console.error("Error fetching chat activity:", error);
      return [];
    }
  };

  return { fetchUsersWithChatActivity };
};
