
import { supabase } from "@/integrations/supabase/client";

export const useChatUserIds = () => {
  // Helper function to fetch users with chat activity
  const fetchUsersWithChatActivity = async (): Promise<string[]> => {
    try {
      // First try chat_messages table
      const { data: chatMessagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('user_id')
        .not('user_id', 'is', null);

      // Then try chat_logs table
      const { data: chatLogsData, error: logsError } = await supabase
        .from('chat_logs')
        .select('user_id')
        .not('user_id', 'is', null);

      if (messagesError && logsError) {
        console.error("Error fetching chat activity:", messagesError, logsError);
        return [];
      }

      // Combine results from both tables
      const allChatData = [
        ...(chatMessagesData || []), 
        ...(chatLogsData || [])
      ];

      // Get unique user IDs
      const uniqueUserIds = [...new Set(allChatData.map(item => item.user_id))];
      
      return uniqueUserIds.filter(Boolean); // Filter out any null/undefined values
    } catch (error) {
      console.error("Error fetching chat activity:", error);
      return [];
    }
  };

  return { fetchUsersWithChatActivity };
};
