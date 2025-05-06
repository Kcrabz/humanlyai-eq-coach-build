
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, SubscriptionTier } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { UserOperations } from "./UserOperations";
import { Search, Filter, X } from "lucide-react";

interface UserTableData extends User {
  created_at?: string;
  updated_at?: string;
}

interface UserManagementProps {
  initialFilter?: { type: string; value: string };
  onResetFilter?: () => void;
}

export const UserManagement = ({ initialFilter, onResetFilter }: UserManagementProps) => {
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
    if (onResetFilter) {
      onResetFilter();
    }
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

  return (
    <div className="space-y-6">
      {/* Active filter indicator */}
      {activeFilter && (
        <div className="bg-muted p-3 rounded-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>Viewing: <strong>{activeFilter}</strong></span>
          </div>
          <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-2">
            <X className="h-4 w-4 mr-1" /> Clear Filter
          </Button>
        </div>
      )}
      
      {/* Filters and search */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={archetypeFilter} onValueChange={setArchetypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by archetype" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Archetypes</SelectItem>
              <SelectItem value="reflector">Reflector</SelectItem>
              <SelectItem value="activator">Activator</SelectItem>
              <SelectItem value="regulator">Regulator</SelectItem>
              <SelectItem value="connector">Connector</SelectItem>
              <SelectItem value="observer">Observer</SelectItem>
              <SelectItem value="not-set">Not Set</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={() => fetchUsers()} variant="outline">
          Refresh
        </Button>
      </div>

      {/* User table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Archetype</TableHead>
              <TableHead>Onboarded</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.name || "-"}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={user.subscription_tier === "premium" ? "default" : 
                             user.subscription_tier === "basic" ? "outline" : "secondary"}
                    >
                      {user.subscription_tier || "free"}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.eq_archetype || "Not set"}</TableCell>
                  <TableCell>{user.onboarded ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    <UserOperations 
                      user={user} 
                      onUpdateTier={handleUpdateTier} 
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
