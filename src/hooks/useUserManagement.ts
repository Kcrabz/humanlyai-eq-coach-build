
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, SubscriptionTier } from "@/types";
import { toast } from "sonner";

// Fixed TypeScript error by making email required in UserTableData
interface UserTableData extends Omit<User, 'email'> {
  email: string;
  created_at?: string;
  updated_at?: string;
}

export const useUserManagement = (initialFilter?: { type: string; value: string }) => {
  const [users, setUsers] = useState<UserTableData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [archetypeFilter, setArchetypeFilter] = useState<string>("all");
  const [onboardedFilter, setOnboardedFilter] = useState<string>("all");
  const [chatFilter, setChatFilter] = useState<string>("all");
  const [filteredUsers, setFilteredUsers] = useState<UserTableData[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Set initial filters based on props
  useEffect(() => {
    if (initialFilter && initialFilter.type && initialFilter.value) {
      switch (initialFilter.type) {
        case "tier":
          setTierFilter(initialFilter.value);
          setActiveFilter(`Subscription: ${initialFilter.value.charAt(0).toUpperCase() + initialFilter.value.slice(1)}`);
          break;
        case "archetype":
          setArchetypeFilter(initialFilter.value);
          setActiveFilter(`Archetype: ${initialFilter.value === "not-set" ? "Not Set" : initialFilter.value.charAt(0).toUpperCase() + initialFilter.value.slice(1)}`);
          break;
        case "onboarded":
          setOnboardedFilter(initialFilter.value);
          setActiveFilter("Onboarded Users");
          break;
        case "chat":
          setChatFilter(initialFilter.value);
          setActiveFilter("Users with Chat Activity");
          break;
        case "all":
          resetFilters();
          setActiveFilter("All Users");
          break;
      }
    }
  }, [initialFilter]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setTierFilter("all");
    setArchetypeFilter("all");
    setOnboardedFilter("all");
    setChatFilter("all");
    setActiveFilter(null);
  };

  // Helper function to fetch users with chat activity
  const fetchUsersWithChatActivity = async () => {
    try {
      const { data: chatData, error: chatError } = await supabase
        .from('chat_messages')
        .select('user_id')
        .not('user_id', 'is', null);

      if (chatError) throw chatError;

      // Get unique user IDs
      const userIds = [...new Set(chatData.map(item => item.user_id))];
      return userIds;
    } catch (error) {
      console.error("Error fetching chat activity:", error);
      return [];
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
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

  // Apply filters and search
  useEffect(() => {
    if (!users) return;

    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        (user.email && user.email.toLowerCase().includes(term)) ||
        (user.name && user.name.toLowerCase().includes(term))
      );
    }

    // Apply tier filter
    if (tierFilter !== "all") {
      filtered = filtered.filter(user => user.subscription_tier === tierFilter);
    }

    // Apply archetype filter
    if (archetypeFilter !== "all") {
      if (archetypeFilter === "not-set") {
        filtered = filtered.filter(user => !user.eq_archetype || user.eq_archetype === "Not set");
      } else {
        filtered = filtered.filter(user => user.eq_archetype === archetypeFilter);
      }
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, tierFilter, archetypeFilter]);

  // Load users on component mount or when filters change
  useEffect(() => {
    fetchUsers();
  }, [onboardedFilter, chatFilter]);

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

  return {
    users: filteredUsers,
    isLoading,
    searchTerm,
    setSearchTerm,
    tierFilter,
    setTierFilter,
    archetypeFilter,
    setArchetypeFilter,
    activeFilter,
    resetFilters,
    fetchUsers,
    handleUpdateTier,
  };
};
