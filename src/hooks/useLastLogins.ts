
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type LastLoginData = {
  relative: string;
  timestamp: string;
};

export const useLastLogins = () => {
  // Fetch last login time for users
  const fetchLastLogins = async (userIds: string[]): Promise<Map<string, string | LastLoginData>> => {
    try {
      if (!userIds || userIds.length === 0) {
        return new Map();
      }

      // Get current session auth token
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Session error:", sessionError);
        toast.error("Authentication error", { description: "Please try logging in again" });
        return new Map();
      }
      
      if (!sessionData.session) {
        console.error("No authenticated session found");
        toast.error("Authentication error", { description: "Please log in again" });
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
        toast.error("Failed to fetch user login data", { 
          description: error.message || "An unexpected error occurred" 
        });
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
    } catch (error) {
      console.error("Failed to fetch last logins:", error);
      toast.error("Failed to fetch user login data");
      return new Map();
    }
  };

  return { fetchLastLogins };
};
