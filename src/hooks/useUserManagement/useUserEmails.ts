
import { supabase } from "@/integrations/supabase/client";

export const useUserEmails = () => {
  // Fetch user emails from the admin edge function
  const fetchUserEmails = async (userIds: string[]) => {
    if (!userIds.length) return new Map();
    
    try {      
      const { data, error } = await supabase.functions.invoke('admin-get-user-emails', {
        body: { userIds },
      });

      if (error) {
        console.error("Error fetching user emails:", error);
        return new Map();
      }

      // Create a map of user IDs to emails
      const emailMap = new Map();
      if (data && Array.isArray(data)) {
        data.forEach((item: { id: string; email: string }) => {
          if (item && item.id && item.email) {
            emailMap.set(item.id, item.email);
          }
        });
      }

      return emailMap;
    } catch (error) {
      console.error("Failed to fetch user emails:", error);
      return new Map();
    }
  };

  return { fetchUserEmails };
};
