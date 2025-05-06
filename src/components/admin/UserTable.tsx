
import { SubscriptionTier } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserOperations } from "./UserOperations";
import { UserTableData } from "@/hooks/useUserManagement/types";

interface UserTableProps {
  users: UserTableData[];
  isLoading: boolean;
  onUpdateTier: (userId: string, tier: SubscriptionTier) => Promise<void>;
}

export const UserTable = ({ users, isLoading, onUpdateTier }: UserTableProps) => {
  return (
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
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6">
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
                <TableCell>{user.onboarded ? "Yes" : "No"}</TableCell>
                <TableCell>
                  <UserOperations 
                    user={user} 
                    onUpdateTier={onUpdateTier} 
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
