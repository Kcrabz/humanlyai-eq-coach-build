
import { memo, useCallback } from "react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { UserTableProps } from "./types";
import { UserTableHeader } from "./UserTableHeader";
import { UserTableRow } from "./UserTableRow";
import { LoadingRows } from "./LoadingRows";

const UserTableComponent = ({ users, isLoading, onUpdateTier, onUserDeleted }: UserTableProps) => {
  // Memoize handlers to prevent re-renders
  const handleUserDeleted = useCallback((userId: string) => {
    if (onUserDeleted) {
      onUserDeleted(userId);
    }
  }, [onUserDeleted]);
  
  const handleUpdateTier = useCallback(async (userId: string, tier: any) => {
    if (onUpdateTier) {
      await onUpdateTier(userId, tier);
    }
  }, [onUpdateTier]);

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
              onUpdateTier={handleUpdateTier}
              onUserDeleted={handleUserDeleted}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export const UserTable = memo(UserTableComponent);
