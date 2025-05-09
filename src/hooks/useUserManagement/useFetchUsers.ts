
import { useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// This hook handles the core logic of fetching users with filters
export const useFetchUsers = (
  isAdmin: boolean,
  setIsLoading: (loading: boolean) => void, 
  setUsers: (users: any[]) => void,
  userData: { fetchUserData: () => Promise<{ userIds: string[], emailData: any[] }> },
  lastLogins: { fetchLastLogins: (userIds: string[]) => Promise<Map<string, any>> },
  chatActivity: { fetchChatActivity: (userIds: string[]) => Promise<Map<string, any>> },
  fetchTokenUsageData: (userIds: string[]) => Promise<Record<string, { usage: number; limit: number }>>
) => {
  const fetchInProgressRef = useRef(false);

  // Main function to fetch users with filters
  const fetchUsers = useCallback(async (onboardedValue = "all", filters: { 
    searchTerm: string,
    tierFilter: string,
    archetypeFilter: string
  } = { searchTerm: "", tierFilter: "all", archetypeFilter: "all" }) => {
    if (!isAdmin || fetchInProgressRef.current) return;
    
    fetchInProgressRef.current = true;
    setIsLoading(true);
    
    try {
      console.log("Fetching users with filters:", { 
        searchTerm: filters.searchTerm, 
        tierFilter: filters.tierFilter, 
        archetypeFilter: filters.archetypeFilter, 
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
      const searchTermLower = filters.searchTerm.toLowerCase();
      
      if (searchTermLower) {
        userList = userList.filter(user =>
          user.email.toLowerCase().includes(searchTermLower) ||
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
      
      // Set the filtered user list
      setUsers(userList);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users", { 
        description: "There was a problem fetching user data" 
      });
    } finally {
      setIsLoading(false);
      fetchInProgressRef.current = false;
    }
  }, [isAdmin, userData, lastLogins, chatActivity, fetchTokenUsageData, setIsLoading, setUsers]);

  return { fetchUsers };
};
