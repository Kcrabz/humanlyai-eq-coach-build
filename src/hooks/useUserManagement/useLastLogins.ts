
import { supabase } from "@/integrations/supabase/client";

export const useLastLogins = () => {
  // Fetch last login time for users
  const fetchLastLogins = async (userIds: string[]): Promise<Map<string, string>> => {
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
        console.error("Error fetching last logins:", error);
        throw error;
      }
      
      // Convert the object to a Map
      const loginMap = new Map<string, string>();
      
      if (data && data.lastLogins) {
        Object.entries(data.lastLogins).forEach(([userId, lastLogin]) => {
          loginMap.set(userId, lastLogin as string);
        });
      }
      
      return loginMap;
    } catch (error) {
      console.error("Failed to fetch last logins:", error);
      return new Map();
    }
  };

  return { fetchLastLogins };
};
