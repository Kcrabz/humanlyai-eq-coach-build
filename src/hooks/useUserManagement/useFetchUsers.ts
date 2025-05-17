
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
      return Promise.resolve();
    }

    try {
      // Mark fetch as in progress to prevent parallel fetches
      fetchInProgressRef.current = true;
      setIsLoading(true);

      // Fetch basic user data first
      const users = await userData.fetchUserData(onboardedValue);
      
      if (!users || users.length === 0) {
        setUsers([]);
        return Promise.resolve();
      }
      
      // Extract user IDs for additional data fetching
      const userIds = users.map(user => user.id);
      
      // Fetch additional data in parallel
      const [loginMap, chatData, tokenData] = await Promise.all([
        lastLogins.fetchLastLogins(userIds),
        chatActivity.fetchChatActivity(userIds),
        fetchTokenUsageData(userIds)
      ]);
      
      // Combine all data
      const combinedUsers = users.map(user => ({
        ...user,
        last_login: loginMap.get(user.id) || 'Never',
        chat_time: chatData.chatTimes.get(user.id) || '0 mins',
        message_count: chatData.messageCounts.get(user.id) || 0,
        tokenUsage: tokenData.usageMap.get(user.id) || 0,
        tokenUsageLimit: tokenData.limitMap.get(user.id) || 0
      }));
      
      setUsers(combinedUsers);
      return Promise.resolve();
    } catch (error) {
      console.error('Error fetching users:', error);
      return Promise.reject(error);
    } finally {
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
