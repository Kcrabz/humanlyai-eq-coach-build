
import { supabase } from "@/integrations/supabase/client";

export const useChatActivity = () => {
  // Fetch chat activity
  const fetchChatActivity = async (userIds: string[]): Promise<Map<string, { count: number, chatTime: string }>> => {
    try {
      if (!userIds || userIds.length === 0) {
        return new Map();
      }

      // Get current session auth token
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.error("No authenticated session found");
        return new Map();
      }

      // Call our admin-user-activity edge function
      const { data, error } = await supabase.functions.invoke('admin-user-activity', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`
        },
        body: { userIds }
      });
      
      if (error) {
        console.error("Error fetching chat activity:", error);
        throw error;
      }
      
      // Convert the object to a Map
      const chatMap = new Map<string, { count: number, chatTime: string }>();
      
      if (data && data.chatActivity) {
        Object.entries(data.chatActivity).forEach(([userId, activityData]) => {
          const typedData = activityData as { count: number, chatTime: string };
          chatMap.set(userId, typedData);
        });
      }
      
      return chatMap;
    } catch (error) {
      console.error("Error fetching chat activity:", error);
      return new Map();
    }
  };

  return { fetchChatActivity };
};
