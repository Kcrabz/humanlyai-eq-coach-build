
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
        throw error;
      }

      // Create a map of user IDs to emails
      const emailMap = new Map();
      if (data && data.data) {
        data.data.forEach((item: { id: string; email: string }) => {
          if (item.email) {
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
