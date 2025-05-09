
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

export const useUserManagement = (initialFilter?: FilterState, mountingComplete = false) => {
  const [users, setUsers] = useState<UserTableData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(false);
  const [tokenUsageData, setTokenUsageData] = useState<Record<string, { usage: number; limit: number }>>({});
  const { isAdmin } = useAdminCheck();
  const initialLoadRef = useRef(false);
  const filtersStableRef = useRef(false);
  const fetchInProgressRef = useRef(false);
  const filtersChangedRef = useRef(false);
  
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

  // Stable version of the filters for dependency tracking
  const stableFilters = useRef({
    searchTerm,
    tierFilter,
    archetypeFilter,
    onboardedFilter
  });
  
  // Update stable filters reference when filters change
  useEffect(() => {
    if (filtersStableRef.current) {
      filtersChangedRef.current = true;
    }
    
    stableFilters.current = {
      searchTerm,
      tierFilter,
      archetypeFilter,
      onboardedFilter
    };
  }, [searchTerm, tierFilter, archetypeFilter, onboardedFilter]);
  
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
  
  // Fixed fetchTokenUsageData with better error handling and async/await syntax
  const fetchTokenUsageData = useCallback(async (userIds: string[]) => {
    if (!userIds.length) return {};
    
    const usageMap: Record<string, { usage: number; limit: number }> = {};
    
    try {
      // Get the current month in YYYY-MM format for filtering
      const currentDate = new Date();
      const currentMonthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      
      // Fetch token usage for the current month
      const { data: usageData, error: usageError } = await supabase
        .from('usage_logs')
        .select('user_id, token_count')
        .eq('month_year', currentMonthYear)
        .in('user_id', userIds);
      
      if (usageError) {
        console.error("Error fetching token usage:", usageError);
        return usageMap; // Return empty map on error
      }
      
      // Calculate total usage per user
      if (usageData) {
        usageData.forEach(log => {
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
        return usageMap; // Return partial map with just usage data
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
      
      setTokenUsageData(usageMap); // Update state with fetched data
      return usageMap;
    } catch (err) {
      console.error("Error processing token usage data:", err);
      return usageMap; // Return whatever we have on error
    }
  }, []);
  
  // Completely rewritten fetchUsers to prevent dependency issues
  const fetchUsers = useCallback(async (onboardedValue = "all") => {
    if (!isAdmin || fetchInProgressRef.current) return;
    
    fetchInProgressRef.current = true;
    setIsLoading(true);
    
    try {
      console.log("Fetching users with filters:", { 
        searchTerm: stableFilters.current.searchTerm, 
        tierFilter: stableFilters.current.tierFilter, 
        archetypeFilter: stableFilters.current.archetypeFilter, 
        onboardedValue 
      });
      
      // First, get all user IDs and data
      const { userIds, emailData } = await userData.fetchUserData();
      
      if (userIds.length === 0) {
        setUsers([]);
        return;
      }
      
      // Then fetch token usage data for all users in parallel
      const usagePromise = fetchTokenUsageData(userIds);
      const loginPromise = lastLogins.fetchLastLogins(userIds);
      const activityPromise = chatActivity.fetchChatActivity(userIds);
      
      // Wait for all promises to resolve
      const [usageData, userLastLogins, userChatActivity] = await Promise.all([
        usagePromise,
        loginPromise,
        activityPromise
      ]);
      
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
      
      // Apply filters
      const currentFilters = stableFilters.current;
      const searchTermLower = currentFilters.searchTerm.toLowerCase();
      
      if (searchTermLower) {
        userList = userList.filter(user =>
          user.email.toLowerCase().includes(searchTermLower) ||
          (user.name && user.name.toLowerCase().includes(searchTermLower))
        );
      }
      
      if (currentFilters.tierFilter && currentFilters.tierFilter !== "all") {
        userList = userList.filter(user => user.subscription_tier === currentFilters.tierFilter);
      }
      
      if (currentFilters.archetypeFilter && currentFilters.archetypeFilter !== "all") {
        userList = userList.filter(user => user.eq_archetype === currentFilters.archetypeFilter);
      }
      
      if (onboardedValue !== "all") {
        const onboardedStatus = onboardedValue === "true";
        userList = userList.filter(user => user.onboarded === onboardedStatus);
      }
      
      // Set the filtered user list
      setUsers(userList);
      
      // Reset the filters changed flag
      filtersChangedRef.current = false;
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users", { 
        description: "There was a problem fetching user data" 
      });
    } finally {
      setIsLoading(false);
      fetchInProgressRef.current = false;
      
      // Set flag to indicate filters are stable after first load
      if (!filtersStableRef.current) {
        filtersStableRef.current = true;
      }
    }
  }, [isAdmin, userData, lastLogins, chatActivity, fetchTokenUsageData]);
  
  // Handle initial data fetch
  useEffect(() => {
    // Skip effect during initial render and if not an admin or still mounting
    if (!isAdmin || !mountingComplete) return;
    
    const loadInitialData = async () => {
      if (!initialLoadRef.current) {
        console.log("Initial data fetch for users");
        initialLoadRef.current = true;
        await fetchUsers(onboardedFilter);
      }
    };
    
    loadInitialData();
    
    // No cleanup needed
  }, [isAdmin, mountingComplete, fetchUsers, onboardedFilter]);
  
  // Trigger filter changes with debouncing
  useEffect(() => {
    if (!isAdmin || !initialLoadRef.current) return;
    
    // Skip if mounting is not complete
    if (!mountingComplete) return;
    
    // Skip the first filter initialization
    if (!filtersStableRef.current) return;
    
    console.log("Filters changed, setting fetch timer");
    
    // Set a flag to fetch data
    setShouldFetch(true);
    
    // We're tracking filters changed in the effect above
    
    // No cleanup needed
  }, [searchTerm, tierFilter, archetypeFilter, onboardedFilter, isAdmin, mountingComplete]);
  
  // Handle delayed fetch after filters change
  useEffect(() => {
    if (!shouldFetch || !filtersChangedRef.current || !mountingComplete) return;
    
    console.log("Filters debounce timer triggered, fetching users");
    
    // Reset the flag
    setShouldFetch(false);
    
    // Perform the fetch
    fetchUsers(onboardedFilter);
    
    // No cleanup needed
  }, [shouldFetch, fetchUsers, onboardedFilter, mountingComplete]);

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
      
      // Refresh the user list without changing the filters
      await fetchUsers(onboardedFilter);
      
      toast.success(`Upgraded ${data?.length || 0} users to premium`);
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
