
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserTableData } from "./types";
import { toast } from "sonner";
import { SubscriptionTier } from "@/types";
import { useChatUserIds } from "./useChatUserIds";

export const useUserData = () => {
  const [users, setUsers] = useState<UserTableData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { fetchUsersWithChatActivity } = useChatUserIds();
  
  // Fetch all users
  const fetchUsers = async (onboardedFilter: string = "all", chatFilter: string = "all") => {
    setIsLoading(true);
    try {
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

      if (error) throw error;

      // Filter by chat activity if needed
      if (chatFilter === "true" && chatUserIds.length > 0) {
        data = data.filter(profile => chatUserIds.includes(profile.id));
      }

      // Add auth emails to the profiles data
      const usersWithEmails = await Promise.all(
        (data || []).map(async (profile) => {
          // For each profile, fetch the user email from auth
          const { data: authData } = await supabase.auth.admin.getUserById(profile.id);
          return {
            ...profile,
            email: authData?.user?.email || 'Unknown',
          } as UserTableData;
        })
      );

      setUsers(usersWithEmails);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

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

  return { users, isLoading, fetchUsers, handleUpdateTier };
};
