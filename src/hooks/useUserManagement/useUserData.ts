
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserTableData } from "./types";
import { toast } from "sonner";
import { SubscriptionTier } from "@/types";

export const useUserData = () => {
  const [users, setUsers] = useState<UserTableData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Fetch user emails from the admin edge function
  const fetchUserEmails = async (userIds: string[]) => {
    if (!userIds.length) return new Map();
    
    try {
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
      return new Map();
    }
  };
  
  // Fetch chat activity
  const fetchChatActivity = async (): Promise<Map<string, { count: number, chatTime: string }>> => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('user_id, created_at')
        .not('user_id', 'is', null);

      if (error) throw error;
      
      // Count messages per user and estimate chat time
      const chatStats = new Map<string, { count: number, chatTime: string }>();
      
      if (data && data.length > 0) {
        data.forEach(message => {
          const userId = message.user_id;
          const current = chatStats.get(userId) || { count: 0, chatTime: '0' };
          
          // Increment message count
          current.count += 1;
          
          // Estimate chat time (30 seconds per message is our assumption)
          const timeInMinutes = Math.round((current.count * 30) / 60);
          let timeDisplay = '';
          
          if (timeInMinutes < 60) {
            timeDisplay = `${timeInMinutes} min`;
          } else {
            const hours = Math.floor(timeInMinutes / 60);
            const mins = timeInMinutes % 60;
            timeDisplay = `${hours}h ${mins > 0 ? mins + 'm' : ''}`;
          }
          
          current.chatTime = timeDisplay;
          chatStats.set(userId, current);
        });
      }
      
      return chatStats;
    } catch (error) {
      console.error("Error fetching chat activity:", error);
      return new Map();
    }
  };
  
  // Fetch last login time for users
  const fetchLastLogins = async (): Promise<Map<string, string>> => {
    try {
      // For each user, we'll get the latest auth session
      // This is an approximation - in a real app you'd want to store this info explicitly
      const { data, error } = await supabase.auth.admin.listUsers();
      
      if (error) {
        console.error("Error fetching user sessions:", error);
        throw error;
      }
      
      const loginMap = new Map<string, string>();
      
      // Format the last sign in time
      if (data && data.users) {
        data.users.forEach(user => {
          if (user.last_sign_in_at) {
            const lastLogin = new Date(user.last_sign_in_at);
            const now = new Date();
            const diffDays = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
            
            let formatted = '';
            if (diffDays === 0) {
              formatted = 'Today';
            } else if (diffDays === 1) {
              formatted = 'Yesterday';
            } else if (diffDays < 7) {
              formatted = `${diffDays} days ago`;
            } else if (diffDays < 30) {
              const weeks = Math.floor(diffDays / 7);
              formatted = `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
            } else {
              formatted = lastLogin.toLocaleDateString();
            }
            
            loginMap.set(user.id, formatted);
          }
        });
      }
      
      return loginMap;
    } catch (error) {
      console.error("Failed to fetch last logins:", error);
      return new Map();
    }
  };
  
  // Fetch users with chat activity
  const fetchUsersWithChatActivity = async (): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('user_id')
        .not('user_id', 'is', null);

      if (error) throw error;

      // Get unique user IDs
      const userIds = [...new Set(data.map(item => item.user_id))];
      return userIds;
    } catch (error) {
      console.error("Error fetching chat activity:", error);
      return [];
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

      if (!data || !Array.isArray(data)) {
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
      
      // Fetch chat activity data
      const chatActivityMap = await fetchChatActivity();
      
      // Fetch last login data (this might be an approximation)
      const lastLoginMap = await fetchLastLogins();
      
      // Add emails and activity data to the profiles
      const usersWithData = data.map(profile => {
        const chatActivity = chatActivityMap.get(profile.id);
        
        return {
          ...profile,
          email: emailMap.get(profile.id) || 'Unknown',
          last_login: lastLoginMap.get(profile.id) || 'Never',
          chat_time: chatActivity?.chatTime || null,
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
  }, []);

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
