
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserTableData, FilterState } from "./types";
import { SubscriptionTier } from "@/types";

// Type for the filters reference
interface FiltersRef {
  current: {
    searchTerm: string;
    tierFilter: string;
    archetypeFilter: string;
    onboardedFilter: string;
  };
}

export function useStableUserData(filtersRef: FiltersRef) {
  const [users, setUsers] = useState<UserTableData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Use refs to manage ongoing fetches and cache data
  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchInProgressRef = useRef(false);
  const emailCacheRef = useRef<Map<string, string>>(new Map());
  const fetchCountRef = useRef(0);
  
  // Fetch all user data in a single, optimized function
  const fetchUsers = useCallback(async () => {
    // Return early if a fetch is already in progress
    if (fetchInProgressRef.current) {
      console.log("Fetch already in progress, waiting for it to complete");
      return;
    }
    
    // Cancel any existing fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create a new abort controller for this fetch
    abortControllerRef.current = new AbortController();
    fetchInProgressRef.current = true;
    setIsLoading(true);
    setError(null);
    
    // Generate a unique fetch ID to prevent race conditions
    const currentFetchId = ++fetchCountRef.current;
    
    try {
      // STEP 1: Fetch profile data
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) throw profilesError;
      if (!profiles) throw new Error("No profiles returned");
      
      // Get user IDs from profiles
      const userIds = profiles.map(profile => profile.id);
      if (userIds.length === 0) {
        setUsers([]);
        setIsLoading(false);
        fetchInProgressRef.current = false;
        return;
      }
      
      // STEP 2: Fetch user emails, making sure to use cached emails when available
      const uncachedIds = userIds.filter(id => !emailCacheRef.current.has(id));
      let emailMap = new Map<string, string>();
      
      // Only fetch emails for IDs we don't already have
      if (uncachedIds.length > 0) {
        const { data: emailData, error: emailError } = await supabase.functions.invoke('admin-get-user-emails', {
          body: { userIds: uncachedIds },
        });
        
        if (emailError) {
          console.error("Error fetching emails:", emailError);
        } else if (emailData && Array.isArray(emailData)) {
          // Update email cache
          emailData.forEach((item: { id: string; email: string }) => {
            if (item?.id && item?.email) {
              emailCacheRef.current.set(item.id, item.email);
            }
          });
        }
      }
      
      // Use all cached emails
      emailMap = emailCacheRef.current;
      
      // Check if this fetch is still the most recent one
      if (currentFetchId !== fetchCountRef.current) {
        console.log("Fetch superseded by newer fetch, discarding results");
        return;
      }
      
      // STEP 3: Fetch last logins in parallel with token usage
      const [loginData, usageData] = await Promise.all([
        fetchLastLogins(userIds),
        fetchTokenUsage(userIds)
      ]);
      
      // STEP 4: Fetch chat activity
      const activityData = await fetchChatActivity(userIds);
      
      // Combine all data into a single user object
      const combinedUsers = profiles.map(profile => {
        const userId = profile.id;
        return {
          id: userId,
          email: emailMap.get(userId) || 'Unknown',
          name: profile.name || profile.first_name || '',
          subscription_tier: profile.subscription_tier || 'free',
          eq_archetype: profile.eq_archetype || '',
          onboarded: profile.onboarded || false,
          last_login: loginData.get(userId) || 'No login data',
          chat_time: activityData.get(userId)?.chatTime || "",
          message_count: activityData.get(userId)?.count || 0,
          tokenUsage: usageData[userId]?.usage || 0,
          tokenUsageLimit: usageData[userId]?.limit || 0
        };
      });
      
      // Apply filters
      const { searchTerm, tierFilter, archetypeFilter, onboardedFilter } = filtersRef.current;
      
      let filteredUsers = combinedUsers;
      
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredUsers = filteredUsers.filter(user =>
          (user.email && user.email.toLowerCase().includes(searchLower)) ||
          (user.name && user.name.toLowerCase().includes(searchLower))
        );
      }
      
      // Filter by tier
      if (tierFilter && tierFilter !== 'all') {
        filteredUsers = filteredUsers.filter(user => 
          user.subscription_tier === tierFilter
        );
      }
      
      // Filter by archetype
      if (archetypeFilter && archetypeFilter !== 'all') {
        filteredUsers = filteredUsers.filter(user => 
          archetypeFilter === 'not-set'
            ? !user.eq_archetype
            : user.eq_archetype === archetypeFilter
        );
      }
      
      // Filter by onboarded status
      if (onboardedFilter !== 'all') {
        const onboardedStatus = onboardedFilter === 'true';
        filteredUsers = filteredUsers.filter(user => 
          user.onboarded === onboardedStatus
        );
      }
      
      // Update state with filtered users
      setUsers(filteredUsers);
      setError(null);
      
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      // Only clear loading state if this is still the current fetch
      if (currentFetchId === fetchCountRef.current) {
        setIsLoading(false);
        fetchInProgressRef.current = false;
      }
    }
  }, [filtersRef]);
  
  // Helper function to fetch last logins
  const fetchLastLogins = async (userIds: string[]): Promise<Map<string, any>> => {
    try {
      // Get session for auth
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        return new Map();
      }
      
      // Call admin-user-activity edge function
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
      
      // Process and return the data
      const loginMap = new Map<string, any>();
      if (data && data.lastLogins) {
        Object.entries(data.lastLogins).forEach(([userId, lastLogin]) => {
          loginMap.set(userId, lastLogin);
        });
      }
      
      return loginMap;
    } catch (err) {
      console.error("Failed to fetch last logins:", err);
      return new Map();
    }
  };
  
  // Helper function to fetch chat activity
  const fetchChatActivity = async (userIds: string[]): Promise<Map<string, { count: number, chatTime: string }>> => {
    try {
      // Get session for auth
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        return new Map();
      }
      
      // Call admin-user-activity edge function
      const { data, error } = await supabase.functions.invoke('admin-user-activity', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`
        },
        body: { userIds }
      });
      
      if (error) {
        console.error("Error fetching chat activity:", error);
        return new Map();
      }
      
      // Process and return the data
      const chatMap = new Map<string, { count: number, chatTime: string }>();
      if (data && data.chatActivity) {
        Object.entries(data.chatActivity).forEach(([userId, activityData]) => {
          const typedData = activityData as { count: number, chatTime: string };
          chatMap.set(userId, typedData);
        });
      }
      
      return chatMap;
    } catch (error) {
      console.error("Error fetching chat activity:", error);
      return new Map();
    }
  };
  
  // Helper function to fetch token usage
  const fetchTokenUsage = async (userIds: string[]): Promise<Record<string, { usage: number; limit: number }>> => {
    if (!userIds.length) return {};
    
    const usageMap: Record<string, { usage: number; limit: number }> = {};
    
    try {
      // Get the current month in YYYY-MM format
      const currentDate = new Date();
      const currentMonthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      
      // Initialize all users with zero usage
      userIds.forEach(id => {
        usageMap[id] = { usage: 0, limit: 0 };
      });
      
      // Fetch token usage for the current month
      const { data: usageData, error: usageError } = await supabase
        .from('usage_logs')
        .select('user_id, token_count')
        .eq('month_year', currentMonthYear)
        .in('user_id', userIds);
      
      if (usageError) {
        console.error("Error fetching token usage:", usageError);
      } else if (usageData) {
        // Calculate total usage per user
        usageData.forEach(log => {
          if (!usageMap[log.user_id]) {
            usageMap[log.user_id] = { usage: 0, limit: 0 };
          }
          usageMap[log.user_id].usage += log.token_count || 0;
        });
      }
      
      // Get users' subscription tiers to determine limits
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, subscription_tier')
        .in('id', userIds);
      
      if (profilesError) {
        console.error("Error fetching profile tiers:", profilesError);
      } else if (profiles) {
        // Set limits based on subscription tier
        profiles.forEach(profile => {
          if (!usageMap[profile.id]) {
            usageMap[profile.id] = { usage: 0, limit: 0 };
          }
          
          // Set limit based on subscription tier
          switch(profile.subscription_tier) {
            case 'premium':
              usageMap[profile.id].limit = 100000;
              break;
            case 'basic':
              usageMap[profile.id].limit = 50000;
              break;
            default:
              usageMap[profile.id].limit = 25000;
          }
        });
      }
      
      return usageMap;
    } catch (err) {
      console.error("Error processing token usage data:", err);
      return usageMap;
    }
  };
  
  // Function to update a user's subscription tier
  const updateUserTier = useCallback(async (userId: string, tier: SubscriptionTier) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_tier: tier })
        .eq('id', userId);
      
      if (error) {
        throw error;
      }
      
      // Optimistically update the user in the local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, subscription_tier: tier } : user
        )
      );
      
      toast.success(`User subscription updated to ${tier}`);
    } catch (err) {
      console.error("Error updating user tier:", err);
      toast.error("Failed to update user tier");
      setError(err instanceof Error ? err : new Error('Failed to update user tier'));
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Function to delete a user
  const deleteUser = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) {
        throw error;
      }
      
      // Remove the user from the local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      
      toast.success(`User deleted successfully`);
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("Failed to delete user");
      setError(err instanceof Error ? err : new Error('Failed to delete user'));
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Function to upgrade all users to premium
  const upgradeAllUsersToPremium = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ subscription_tier: 'premium' })
        .neq('subscription_tier', 'premium')
        .select('id');
      
      if (error) {
        throw error;
      }
      
      // Update all affected users in the local state
      if (data && data.length > 0) {
        const upgradedIds = data.map(item => item.id);
        setUsers(prevUsers =>
          prevUsers.map(user =>
            upgradedIds.includes(user.id) ? { ...user, subscription_tier: 'premium' } : user
          )
        );
      }
      
      toast.success(`Upgraded ${data?.length || 0} users to premium`);
      return true;
    } catch (err) {
      console.error("Error upgrading users:", err);
      toast.error("Failed to upgrade users to premium");
      setError(err instanceof Error ? err : new Error('Failed to upgrade users'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Initial data fetch when component mounts
  useEffect(() => {
    fetchUsers();
    
    // Cleanup function to abort any in-flight requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      fetchInProgressRef.current = false;
    };
  }, [fetchUsers]);
  
  // Return stable functions and state
  return {
    users,
    isLoading,
    error,
    refetchUsers: fetchUsers,
    updateUserTier,
    deleteUser,
    upgradeAllUsersToPremium
  };
}
