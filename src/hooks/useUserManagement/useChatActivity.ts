
import { supabase } from "@/integrations/supabase/client";

export const useChatActivity = () => {
  // Fetch chat activity
  const fetchChatActivity = async (): Promise<Map<string, { count: number, chatTime: string }>> => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('user_id, created_at')
        .not('user_id', 'is', null);

      if (error) throw error;
      
      // Count messages per user and estimate chat time
      const chatStats = new Map<string, { count: number, chatTime: string }>();
      
      if (data && data.length > 0) {
        data.forEach(message => {
          const userId = message.user_id;
          const current = chatStats.get(userId) || { count: 0, chatTime: '0' };
          
          // Increment message count
          current.count += 1;
          
          // Estimate chat time (30 seconds per message is our assumption)
          const timeInMinutes = Math.round((current.count * 30) / 60);
          let timeDisplay = '';
          
          if (timeInMinutes < 60) {
            timeDisplay = `${timeInMinutes} min`;
          } else {
            const hours = Math.floor(timeInMinutes / 60);
            const mins = timeInMinutes % 60;
            timeDisplay = `${hours}h ${mins > 0 ? mins + 'm' : ''}`;
          }
          
          current.chatTime = timeDisplay;
          chatStats.set(userId, current);
        });
      }
      
      return chatStats;
    } catch (error) {
      console.error("Error fetching chat activity:", error);
      return new Map();
    }
  };

  return { fetchChatActivity };
};
