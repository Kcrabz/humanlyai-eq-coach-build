
import { SubscriptionTier } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserOperations } from "./user-operations";
import { UserTableData } from "@/hooks/useUserManagement/types";
import { Skeleton } from "@/components/ui/skeleton";

interface UserTableProps {
  users: UserTableData[];
  isLoading: boolean;
  onUpdateTier: (userId: string, tier: SubscriptionTier) => Promise<void>;
  onUserDeleted?: (userId: string) => void;
}

export const UserTable = ({ users, isLoading, onUpdateTier, onUserDeleted }: UserTableProps) => {
  const renderLastLoginCell = (user: UserTableData) => {
    if (isLoading) {
      return <Skeleton className="h-4 w-20" />;
    }
    
    return user.last_login || "Never";
  };
  
  const renderChatActivityCell = (user: UserTableData) => {
    if (isLoading) {
      return <Skeleton className="h-4 w-20" />;
    }
    
    if (user.chat_time) {
      return (
        <span title={`${user.message_count || 0} messages`} className="cursor-help">
          {user.chat_time}
        </span>
      );
    }
    
    return "No activity";
  };
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Subscription</TableHead>
            <TableHead>Archetype</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead>Chat Activity</TableHead>
            <TableHead>Onboarded</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array(5).fill(0).map((_, index) => (
              <TableRow key={`loading-${index}`}>
                <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
              </TableRow>
            ))
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-6">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map(user => (
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
                <TableCell>{renderLastLoginCell(user)}</TableCell>
                <TableCell>{renderChatActivityCell(user)}</TableCell>
                <TableCell>{user.onboarded ? "Yes" : "No"}</TableCell>
                <TableCell>
                  <UserOperations 
                    user={user} 
                    onUpdateTier={onUpdateTier}
                    onUserDeleted={onUserDeleted}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
