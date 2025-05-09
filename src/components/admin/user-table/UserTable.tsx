
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { UserTableProps } from "./types";
import { UserTableHeader } from "./UserTableHeader";
import { UserTableRow } from "./UserTableRow";
import { LoadingRows } from "./LoadingRows";

export const UserTable = ({ users, isLoading, onUpdateTier, onUserDeleted }: UserTableProps) => {
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
                onUpdateTier={onUpdateTier}
                onUserDeleted={onUserDeleted}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
