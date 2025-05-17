
import { memo } from "react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { SubscriptionTier } from "@/types";
import { UserTableData } from "@/hooks/useUserManagement/types";
import { UserTableHeader } from "../user-table/UserTableHeader";
import { UserTableRow } from "../user-table/UserTableRow";
import { LoadingRows } from "../user-table/LoadingRows";

interface UserManagementTableProps {
  users: UserTableData[];
  isLoading: boolean;
  onUpdateTier: (userId: string, tier: SubscriptionTier) => Promise<void>;
  onUserDeleted?: (userId: string) => void;
}

// Use memo to prevent unnecessary re-renders
export const UserManagementTable = memo(function UserManagementTable({ 
  users, 
  isLoading, 
  onUpdateTier, 
  onUserDeleted 
}: UserManagementTableProps) {
  // Early return while loading to prevent flash of empty content
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <UserTableHeader />
          <TableBody>
            <LoadingRows />
          </TableBody>
        </Table>
      </div>
    );
  }

  // Empty state
  if (!users || users.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <UserTableHeader />
          <TableBody>
            <TableRow>
              <TableCell colSpan={9} className="text-center py-6">
                No users found
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  // Render users
  return (
    <div className="rounded-md border">
      <Table>
        <UserTableHeader />
        <TableBody>
          {users.map(user => (
            <UserTableRow 
              key={user.id}
              user={user}
              onUpdateTier={onUpdateTier}
              onUserDeleted={onUserDeleted}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
});
