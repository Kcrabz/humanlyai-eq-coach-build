
import { useCallback } from 'react';
import { UserTableData } from './types';

export const useFetchUsers = (
  isAdmin: boolean,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setUsers: React.Dispatch<React.SetStateAction<UserTableData[]>>,
  userData: any,
  lastLogins: any,
  chatActivity: any,
  fetchTokenUsageData: any,
  fetchInProgressRef: React.MutableRefObject<boolean>
) => {
  // The main fetch function that combines all data
  const fetchUsers = useCallback(async (onboardedValue?: string): Promise<void> => {
    // Skip if not an admin or fetch already in progress
    if (!isAdmin || fetchInProgressRef.current) {
      console.log("Fetch skipped: isAdmin=", isAdmin, "fetchInProgress=", fetchInProgressRef.current);
      return Promise.resolve();
    }

    try {
      console.log("Fetching user data starting...");
      
      // Mark fetch as in progress to prevent parallel fetches
      fetchInProgressRef.current = true;
      setIsLoading(true);

      // Fetch basic user data first
      console.log("Fetching basic user data...");
      const { userIds, emailData } = await userData.fetchUserData();
      
      if (!emailData || emailData.length === 0) {
        console.log("No user data found, returning empty array");
        setUsers([]);
        return Promise.resolve();
      }
      
      console.log(`Found ${emailData.length} users, fetching additional data...`);
      
      // Fetch additional data in parallel
      const [loginMap, chatData, tokenData] = await Promise.all([
        lastLogins.fetchLastLogins(userIds),
        chatActivity.fetchChatActivity(userIds),
        fetchTokenUsageData(userIds)
      ]);
      
      // Combine all data
      const combinedUsers = emailData.map(user => {
        const userId = user.id;
        return {
          ...user,
          last_login: loginMap.get(userId) || 'Never',
          chat_time: chatData.chatTimes?.get(userId) || '0 mins',
          message_count: chatData.messageCounts?.get(userId) || 0,
          tokenUsage: tokenData.usageMap?.get(userId) || 0,
          tokenUsageLimit: tokenData.limitMap?.get(userId) || 0
        };
      });
      
      console.log(`Combined data for ${combinedUsers.length} users, updating state...`);
      setUsers(combinedUsers);
      return Promise.resolve();
    } catch (error) {
      console.error('Error fetching users:', error);
      return Promise.reject(error);
    } finally {
      console.log("Fetch complete, resetting loading state");
      setIsLoading(false);
      fetchInProgressRef.current = false;
    }
  }, [
    isAdmin, 
    setIsLoading, 
    setUsers, 
    userData, 
    lastLogins, 
    chatActivity, 
    fetchTokenUsageData, 
    fetchInProgressRef
  ]);

  return { fetchUsers };
};
