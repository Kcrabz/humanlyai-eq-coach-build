
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserTableData } from "./types";
import { toast } from "sonner";
import { SubscriptionTier } from "@/types";
import { useChatUserIds } from "./useChatUserIds";

export const useUserData = () => {
  const [users, setUsers] = useState<UserTableData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { fetchUsersWithChatActivity } = useChatUserIds();
  
  // Fetch user emails from the admin edge function
  const fetchUserEmails = async (userIds: string[]) => {
    try {
      if (!userIds.length) return new Map();
      
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
      toast.error("Failed to fetch user emails");
      return new Map();
    }
  };
  
  // Fetch all users
  const fetchUsers = useCallback(async (onboardedFilter: string = "all", chatFilter: string = "all") => {
    setIsLoading(true);
    try {
      console.log(`Fetching users with filters - onboarded: ${onboardedFilter}, chat: ${chatFilter}`);
      
      // Only fetch users with chat activity if chat filter is active
      let chatUserIds: string[] = [];
      if (chatFilter === "true") {
        chatUserIds = await fetchUsersWithChatActivity();
        if (chatUserIds.length === 0) {
          setUsers([]);
          setIsLoading(false);
          return;
        }
      }

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

      if (!data) {
        setUsers([]);
        setIsLoading(false);
        return;
      }

      // Filter by chat activity if needed
      if (chatFilter === "true" && chatUserIds.length > 0) {
        data = data.filter(profile => chatUserIds.includes(profile.id));
      }
      
      // Collect all user IDs to fetch emails
      const userIds = data.map(profile => profile.id);
      
      // Fetch emails from the admin edge function
      const emailMap = await fetchUserEmails(userIds);
      
      // Add emails to the profiles data
      const usersWithEmails = data.map(profile => ({
        ...profile,
        email: emailMap.get(profile.id) || 'Unknown',
      })) as UserTableData[];

      setUsers(usersWithEmails);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchUsersWithChatActivity]);

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

  return { 
    users, 
    isLoading, 
    fetchUsers, 
    handleUpdateTier,
    handleUserDeleted 
  };
};
