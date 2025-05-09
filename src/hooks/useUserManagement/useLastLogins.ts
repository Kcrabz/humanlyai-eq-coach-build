
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type LastLoginData = {
  relative: string;
  timestamp: string;
};

export const useLastLogins = () => {
  // Fetch last login time for users with improved error handling
  const fetchLastLogins = async (userIds: string[]): Promise<Map<string, string | LastLoginData>> => {
    try {
      if (!userIds || userIds.length === 0) {
        return new Map();
      }

      // Get current session auth token
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Session error:", sessionError);
        return new Map();
      }
      
      if (!sessionData.session) {
        console.error("No authenticated session found");
        return new Map();
      }

      // Call our admin-user-activity edge function with better error handling
      try {
        const { data, error } = await supabase.functions.invoke('admin-user-activity', {
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`
          },
          body: { userIds }
        });
        
        if (error) {
          console.error("Error fetching last logins:", error);
          return new Map();
        }
        
        // Convert the object to a Map
        const loginMap = new Map<string, string | LastLoginData>();
        
        if (data && data.lastLogins) {
          Object.entries(data.lastLogins).forEach(([userId, lastLogin]) => {
            loginMap.set(userId, lastLogin as string | LastLoginData);
          });
        }
        
        return loginMap;
      } catch (err) {
        console.error("Exception in edge function call:", err);
        return new Map();
      }
    } catch (error) {
      console.error("Failed to fetch last logins:", error);
      return new Map();
    }
  };

  return { fetchLastLogins };
};
