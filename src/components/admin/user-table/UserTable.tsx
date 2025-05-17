
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

  return (
    <div className="rounded-md border">
      <Table>
        <UserTableHeader />
        <TableBody>
          {isLoading ? (
            <LoadingRows />
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-6">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map(user => (
              <UserTableRow 
                key={user.id}
                user={user}
                onUpdateTier={handleUpdateTier}
                onUserDeleted={handleUserDeleted}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export const UserTable = memo(UserTableComponent);
