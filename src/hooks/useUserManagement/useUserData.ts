
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserEmails } from "./useUserEmails";

export const useUserData = () => {
  const { fetchUserEmails } = useUserEmails();
  
  // Fetch all users data
  const fetchUserData = useCallback(async () => {
    try {
      // Build query to fetch all profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (!profiles || !Array.isArray(profiles)) {
        return { userIds: [], emailData: [] };
      }
      
      // Collect all user IDs
      const userIds = profiles.map(profile => profile.id);
      
      // Early return if no users found
      if (userIds.length === 0) {
        return { userIds: [], emailData: [] };
      }
      
      // Fetch emails from the admin edge function
      const emailMap = await fetchUserEmails(userIds);
      
      // Add emails to the profiles
      const emailData = profiles.map(profile => ({
        ...profile,
        email: emailMap.get(profile.id) || 'Unknown'
      }));

      return { userIds, emailData };
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load user data");
      return { userIds: [], emailData: [] };
    }
  }, [fetchUserEmails]);

  return { fetchUserData };
};
