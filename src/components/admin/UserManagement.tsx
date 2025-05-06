
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
import { Search, Filter } from "lucide-react";

interface UserTableData extends User {
  created_at?: string;
  updated_at?: string;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<UserTableData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [archetypeFilter, setArchetypeFilter] = useState<string>("all");
  const [filteredUsers, setFilteredUsers] = useState<UserTableData[]>([]);

  // Fetch all users
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

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

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
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

  return (
    <div className="space-y-6">
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
