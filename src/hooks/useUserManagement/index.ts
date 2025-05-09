
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUserEmails } from "./useUserEmails";
import { useLastLogins } from "./useLastLogins";
import { useChatActivity } from "./useChatActivity";
import { useChatUserIds } from "./useChatUserIds";
import { useUserData } from "./useUserData";
import { useUserFilters } from "./useUserFilters";
import { FilterState, UserTableData } from "./types";
import { SubscriptionTier } from "@/types";
import { useAdminCheck } from "../useAdminCheck";

export const useUserManagement = (initialFilter?: FilterState) => {
  const [users, setUsers] = useState<UserTableData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenUsageData, setTokenUsageData] = useState<Record<string, { usage: number; limit: number }>>({});
  const { isAdmin } = useAdminCheck();
  const initialLoadRef = useRef(false);
  
  // Use the hooks with correct function names
  const userData = useUserData();
  const lastLogins = useLastLogins();
  const chatActivity = useChatActivity();
  const userEmails = useUserEmails();
  const chatUserIds = useChatUserIds();
  
  const { 
    searchTerm, setSearchTerm, 
    tierFilter, setTierFilter, 
    archetypeFilter, setArchetypeFilter,
    onboardedFilter, setOnboardedFilter,
    activeFilter, resetFilters
  } = useUserFilters(initialFilter);
  
  const handleUpdateTier = useCallback(async (userId: string, tier: SubscriptionTier) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_tier: tier })
        .eq('id', userId);
      
      if (error) {
        throw error;
      }
      
      // Optimistically update the user's tier in the local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, subscription_tier: tier } : user
        )
      );
      
      toast.success(`User ${userId} updated to ${tier}`);
    } catch (err) {
      console.error("Error updating user tier:", err);
      toast.error("Failed to update user tier", { 
        description: "There was a problem updating the user's subscription" 
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUserDeleted = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) {
        throw error;
      }
      
      // Optimistically remove the user from the local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      
      toast.success(`User ${userId} deleted successfully`);
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("Failed to delete user", { 
        description: "There was a problem deleting the user" 
      });
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Fixed fetchTokenUsageData to avoid dependency on tokenUsageData state
  const fetchTokenUsageData = useCallback(async (userIds: string[]) => {
    if (!userIds.length) return {};
    
    try {
      // Get the current month in YYYY-MM format for filtering
      const currentDate = new Date();
      const currentMonthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      
      // Fetch token usage for the current month
      const { data, error } = await supabase
        .from('usage_logs')
        .select('user_id, token_count')
        .eq('month_year', currentMonthYear)
        .in('user_id', userIds);
      
      if (error) {
        console.error("Error fetching token usage:", error);
        return {};
      }
      
      // Calculate total usage per user
      const usageMap: Record<string, { usage: number; limit: number }> = {};
      
      // Process usage data
      if (data) {
        data.forEach(log => {
          if (!usageMap[log.user_id]) {
            usageMap[log.user_id] = { usage: 0, limit: 0 };
          }
          usageMap[log.user_id].usage += log.token_count || 0;
        });
      }
      
      // Now get the users' subscription tiers to determine their limits
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, subscription_tier')
        .in('id', userIds);
      
      if (profilesError) {
        console.error("Error fetching profile tiers:", profilesError);
        return {};
      }
      
      // Set limits based on subscription tier
      if (profiles) {
        profiles.forEach(profile => {
          if (!usageMap[profile.id]) {
            usageMap[profile.id] = { usage: 0, limit: 0 };
          }
          
          // Set limit based on subscription tier
          switch(profile.subscription_tier) {
            case 'premium':
              usageMap[profile.id].limit = 100000; // 100k tokens for premium
              break;
            case 'basic':
              usageMap[profile.id].limit = 50000;  // 50k tokens for basic
              break;
            default: // free or trial
              usageMap[profile.id].limit = 25000;  // 25k tokens for free/trial
          }
        });
      }
      
      setTokenUsageData(usageMap);
      return usageMap;
    } catch (err) {
      console.error("Error processing token usage data:", err);
      return {};
    }
  }, []);
  
  // Completely restructured fetchUsers to avoid dependency issues
  const fetchUsers = useCallback(async (onboardedValue = "all") => {
    if (!isAdmin) return;
    
    console.log("Fetching users with filters:", { searchTerm, tierFilter, archetypeFilter, onboardedValue });
    setIsLoading(true);
    
    try {
      // First, get all user IDs
      const { userIds, emailData } = await userData.fetchUserData();
      
      if (userIds.length === 0) {
        setUsers([]);
        setIsLoading(false);
        return;
      }
      
      // Then fetch token usage data for all users - now returns the data
      const usageData = await fetchTokenUsageData(userIds);
      
      // Fetch last login data
      const userLastLogins = await lastLogins.fetchLastLogins(userIds);
      
      // Fetch user activity data
      const userChatActivity = await chatActivity.fetchChatActivity(userIds);
      
      // Combine all data to create the final user list
      let userList = emailData.map(user => {
        const userId = user.id;
        const tokenData = usageData[userId] || { usage: 0, limit: 0 };
        
        return {
          id: userId,
          email: user.email || "Unknown email",
          name: user.name || user.first_name || "",
          subscription_tier: user.subscription_tier || "free",
          eq_archetype: user.eq_archetype || "",
          onboarded: user.onboarded || false,
          last_login: userLastLogins.get(userId) || "No login data",
          chat_time: userChatActivity.get(userId)?.chatTime || "",
          message_count: userChatActivity.get(userId)?.count || 0,
          tokenUsage: tokenData.usage,
          tokenUsageLimit: tokenData.limit
        };
      });
      
      // Apply filters - moved these operations inside the function to remove dependencies
      const searchTermLower = searchTerm.toLowerCase();
      if (searchTerm) {
        userList = userList.filter(user =>
          user.email.toLowerCase().includes(searchTermLower) ||
          (user.name && user.name.toLowerCase().includes(searchTermLower))
        );
      }
      
      if (tierFilter && tierFilter !== "all") {
        userList = userList.filter(user => user.subscription_tier === tierFilter);
      }
      
      if (archetypeFilter && archetypeFilter !== "all") {
        userList = userList.filter(user => user.eq_archetype === archetypeFilter);
      }
      
      if (onboardedValue !== "all") {
        const onboardedStatus = onboardedValue === "true";
        userList = userList.filter(user => user.onboarded === onboardedStatus);
      }
      
      // Set the filtered user list
      setUsers(userList);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users", { 
        description: "There was a problem fetching user data" 
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, userData, lastLogins, chatActivity, fetchTokenUsageData]); // Removed filter dependencies

  // Trigger filter changes
  useEffect(() => {
    if (isAdmin && initialLoadRef.current) {
      console.log("Filters changed, fetching users with new filters");
      fetchUsers(onboardedFilter);
    }
  }, [searchTerm, tierFilter, archetypeFilter, onboardedFilter, fetchUsers, isAdmin]);

  // Initial data fetch - separate from filter changes
  useEffect(() => {
    let isMounted = true;
    
    if (isAdmin && !initialLoadRef.current) {
      console.log("Initial data fetch for users");
      fetchUsers(onboardedFilter);
      initialLoadRef.current = true;
    }
    
    return () => {
      isMounted = false;
    };
  }, [fetchUsers, isAdmin, onboardedFilter]);

  // Handle upgrading all users to premium
  const upgradeAllUsersToPremium = useCallback(async () => {
    try {
      toast.info("Upgrading all users to premium...");
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ subscription_tier: 'premium' })
        .neq('subscription_tier', 'premium')
        .select('id');
        
      if (error) throw error;
      
      // Refresh the user list
      await fetchUsers(onboardedFilter);
      
      toast.success(`Upgraded ${data.length} users to premium`);
      return true;
    } catch (err) {
      console.error("Error upgrading users:", err);
      toast.error("Failed to upgrade users", { 
        description: "There was a problem upgrading users to premium" 
      });
      return false;
    }
  }, [fetchUsers, onboardedFilter]);
  
  return {
    users,
    isLoading,
    searchTerm,
    setSearchTerm,
    tierFilter,
    setTierFilter,
    archetypeFilter,
    setArchetypeFilter,
    onboardedFilter,
    setOnboardedFilter,
    activeFilter,
    resetFilters,
    fetchUsers,
    handleUpdateTier,
    handleUserDeleted,
    upgradeAllUsersToPremium
  };
};
