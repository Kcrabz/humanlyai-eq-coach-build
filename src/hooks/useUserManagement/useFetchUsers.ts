
import { useCallback, useRef } from "react";
import { toast } from "sonner";

// This hook handles the core logic of fetching users with filters
export const useFetchUsers = (
  isAdmin: boolean,
  setIsLoading: (loading: boolean) => void, 
  setUsers: (users: any[]) => void,
  userData: { fetchUserData: () => Promise<{ userIds: string[], emailData: any[] }> },
  lastLogins: { fetchLastLogins: (userIds: string[]) => Promise<Map<string, any>> },
  chatActivity: { fetchChatActivity: (userIds: string[]) => Promise<Map<string, any>> },
  fetchTokenUsageData: (userIds: string[]) => Promise<Record<string, { usage: number; limit: number }>>,
  fetchInProgressRef: React.MutableRefObject<boolean>
) => {
  // Track the fetch abort controller to cancel previous requests
  const abortControllerRef = useRef<AbortController | null>(null);
  // Track the last successful fetch ID to prevent race conditions
  const lastFetchIdRef = useRef<number>(0);
  // Cache for user data to avoid unnecessary fetches
  const dataCache = useRef<{
    timestamp: number;
    users: any[];
    filters: { searchTerm: string, tierFilter: string, archetypeFilter: string, onboardedValue: string } | null;
  }>({
    timestamp: 0,
    users: [],
    filters: null
  });

  // Main function to fetch users with filters
  const fetchUsers = useCallback(async (onboardedValue = "all", filters: { 
    searchTerm: string,
    tierFilter: string,
    archetypeFilter: string
  } = { searchTerm: "", tierFilter: "all", archetypeFilter: "all" }) => {
    // Return early if not admin or fetch already in progress
    if (!isAdmin) return Promise.resolve();
    
    // Check if we have a recent cache with the same filters
    const now = Date.now();
    const CACHE_TTL = 10000; // 10 seconds cache
    const cacheValid = 
      dataCache.current.timestamp > 0 && 
      now - dataCache.current.timestamp < CACHE_TTL &&
      dataCache.current.filters !== null &&
      dataCache.current.filters.searchTerm === filters.searchTerm &&
      dataCache.current.filters.tierFilter === filters.tierFilter &&
      dataCache.current.filters.archetypeFilter === filters.archetypeFilter &&
      dataCache.current.filters.onboardedValue === onboardedValue;

    if (cacheValid && dataCache.current.users.length > 0) {
      console.log("Using cached user data from", new Date(dataCache.current.timestamp).toISOString());
      setUsers(dataCache.current.users);
      return Promise.resolve();
    }
    
    // If a fetch is already in progress, cancel it to prevent race conditions
    if (fetchInProgressRef.current) {
      console.log("Cancelling previous fetch - new fetch requested");
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
    
    // Set up a new abort controller for this fetch
    abortControllerRef.current = new AbortController();
    fetchInProgressRef.current = true;
    setIsLoading(true);
    
    // Generate a unique ID for this fetch operation
    const fetchId = ++lastFetchIdRef.current;
    
    try {      
      console.log(`Starting user data fetch #${fetchId}`);
      
      // First, get all user IDs and data
      let userIds: string[] = [], emailData: any[] = [];
      try {
        const result = await userData.fetchUserData();
        userIds = result.userIds;
        emailData = result.emailData;
      } catch (error) {
        console.warn("Failed to fetch user data:", error);
        toast.error("Failed to load user data", { 
          description: "There was a problem fetching basic user information" 
        });
        setUsers([]);
        setIsLoading(false);
        fetchInProgressRef.current = false;
        return Promise.resolve();
      }
      
      // If the current fetch is no longer the latest, discard results
      if (fetchId !== lastFetchIdRef.current) {
        console.log(`Fetch #${fetchId} superseded by newer fetch, discarding results`);
        return Promise.resolve();
      }
      
      if (userIds.length === 0) {
        setUsers([]);
        setIsLoading(false);
        fetchInProgressRef.current = false;
        return Promise.resolve();
      }
      
      // Then fetch token usage data, logins, and chat activity in parallel with error handling
      let usageData: Record<string, { usage: number; limit: number }> = {};
      let userLastLogins: Map<string, any> = new Map();
      let userChatActivity: Map<string, any> = new Map();
      
      try {
        // Use Promise.allSettled to prevent one failing promise from affecting others
        const [usageResult, loginsResult, activityResult] = await Promise.allSettled([
          fetchTokenUsageData(userIds),
          lastLogins.fetchLastLogins(userIds),
          chatActivity.fetchChatActivity(userIds)
        ]);
        
        // Handle token usage result
        if (usageResult.status === 'fulfilled') {
          usageData = usageResult.value;
        }
        
        // Handle logins result
        if (loginsResult.status === 'fulfilled') {
          userLastLogins = loginsResult.value;
        }
        
        // Handle chat activity result
        if (activityResult.status === 'fulfilled') {
          userChatActivity = activityResult.value;
        }
      } catch (error) {
        console.warn("Error fetching supplementary data:", error);
        // Continue with processing, using what data we have
      }
      
      // If the current fetch is no longer the latest, discard results
      if (fetchId !== lastFetchIdRef.current) {
        console.log(`Fetch #${fetchId} supplementary data superseded by newer fetch, discarding results`);
        return Promise.resolve();
      }
      
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
      const searchTermLower = filters.searchTerm.toLowerCase();
      
      if (searchTermLower) {
        userList = userList.filter(user =>
          (user.email && user.email.toLowerCase().includes(searchTermLower)) ||
          (user.name && user.name.toLowerCase().includes(searchTermLower))
        );
      }
      
      if (filters.tierFilter && filters.tierFilter !== "all") {
        userList = userList.filter(user => user.subscription_tier === filters.tierFilter);
      }
      
      if (filters.archetypeFilter && filters.archetypeFilter !== "all") {
        userList = userList.filter(user => user.eq_archetype === filters.archetypeFilter);
      }
      
      if (onboardedValue !== "all") {
        const onboardedStatus = onboardedValue === "true";
        userList = userList.filter(user => user.onboarded === onboardedStatus);
      }
      
      // Final check if this fetch is still valid
      if (fetchId !== lastFetchIdRef.current) {
        console.log(`Fetch #${fetchId} final results superseded by newer fetch, discarding`);
        return Promise.resolve();
      }
      
      console.log(`Fetch #${fetchId} completed successfully with ${userList.length} users`);
      
      // Update cache
      dataCache.current = {
        timestamp: now,
        users: userList,
        filters: { ...filters, onboardedValue }
      };
      
      // Set the filtered user list
      setUsers(userList);
      return Promise.resolve();
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users", { 
        description: "There was a problem fetching user data" 
      });
      return Promise.reject(error);
    } finally {
      // Clean up
      if (fetchId === lastFetchIdRef.current) {
        setIsLoading(false);
        fetchInProgressRef.current = false;
        abortControllerRef.current = null;
      }
    }
  }, [isAdmin, userData, lastLogins, chatActivity, fetchTokenUsageData, setIsLoading, setUsers, fetchInProgressRef]);

  return { fetchUsers };
};
