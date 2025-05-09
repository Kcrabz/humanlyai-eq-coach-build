
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserTableData } from "./types";
import { toast } from "sonner";
import { SubscriptionTier } from "@/types";
import { useUserEmails } from "./useUserEmails";
import { useChatActivity } from "./useChatActivity";
import { useLastLogins } from "./useLastLogins";
import { useChatUserIds } from "./useChatUserIds";

export const useUserData = () => {
  const [users, setUsers] = useState<UserTableData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Import modularized hooks
  const { fetchUserEmails } = useUserEmails();
  const { fetchChatActivity } = useChatActivity();
  const { fetchLastLogins } = useLastLogins();
  const { fetchUsersWithChatActivity } = useChatUserIds();
  
  // Fetch all users
  const fetchUsers = useCallback(async (onboardedFilter: string = "all") => {
    setIsLoading(true);
    
    try {
      console.log(`Fetching users with filters - onboarded: ${onboardedFilter}`);
      
      // Build query based on filters
      let query = supabase.from('profiles').select('*');

      // Apply onboarded filter directly in the query
      if (onboardedFilter === "true") {
        query = query.eq('onboarded', true);
      } else if (onboardedFilter === "false") {
        query = query.eq('onboarded', false);
      }

      // Get the data
      let { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (!data || !Array.isArray(data)) {
        setUsers([]);
        setIsLoading(false);
        return;
      }
      
      // Collect all user IDs to fetch emails
      const userIds = data.map(profile => profile.id);
      
      // Early return if no users found
      if (userIds.length === 0) {
        setUsers([]);
        setIsLoading(false);
        return;
      }
      
      // Fetch emails from the admin edge function
      const emailMap = await fetchUserEmails(userIds);
      
      // Fetch chat activity data
      const chatActivityMap = await fetchChatActivity(userIds);
      
      // Fetch last login data
      const lastLoginMap = await fetchLastLogins(userIds);
      
      // Add emails and activity data to the profiles
      const usersWithData = data.map(profile => {
        const chatActivity = chatActivityMap.get(profile.id);
        
        return {
          ...profile,
          email: emailMap.get(profile.id) || 'Unknown',
          last_login: lastLoginMap.get(profile.id) || 'Never',
          chat_time: chatActivity?.chatTime || 'No activity',
          message_count: chatActivity?.count || 0
        };
      }) as UserTableData[];

      setUsers(usersWithData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserEmails, fetchChatActivity, fetchLastLogins, fetchUsersWithChatActivity]);

  // Handler for updating user subscription tier
  const handleUpdateTier = async (userId: string, newTier: SubscriptionTier) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_tier: newTier })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, subscription_tier: newTier } 
            : user
        )
      );

      toast.success("Subscription tier updated");
    } catch (error) {
      console.error("Error updating tier:", error);
      toast.error("Failed to update subscription tier");
    }
  };

  // Handler for user deletion
  const handleUserDeleted = (userId: string) => {
    // Update local state to remove the deleted user
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
  };

  // New function to update all users to Premium tier
  const upgradeAllUsersToPremium = async () => {
    try {
      setIsLoading(true);
      
      // Update all profiles to premium tier
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_tier: 'premium' })
        .not('id', 'is', null);

      if (error) throw error;
      
      // Refresh user list after the update
      await fetchUsers();
      
      toast.success("All users have been upgraded to Premium");
    } catch (error) {
      console.error("Error upgrading users:", error);
      toast.error("Failed to upgrade all users");
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    users, 
    isLoading, 
    fetchUsers,
    handleUpdateTier,
    handleUserDeleted,
    upgradeAllUsersToPremium
  };
};
