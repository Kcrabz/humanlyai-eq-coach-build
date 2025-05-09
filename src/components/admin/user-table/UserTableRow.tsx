
import { TableRow, TableCell } from "@/components/ui/table";
import { UserOperations } from "../user-operations";
import { SubscriptionTier } from "@/types";
import { UserTableData } from "@/hooks/useUserManagement/types";
import { LastLoginCell } from "./cells/LastLoginCell";
import { ChatActivityCell } from "./cells/ChatActivityCell";
import { TokenUsageCell } from "./cells/TokenUsageCell";
import { SubscriptionCell } from "./cells/SubscriptionCell";

interface UserTableRowProps {
  user: UserTableData;
  onUpdateTier: (userId: string, tier: SubscriptionTier) => Promise<void>;
  onUserDeleted?: (userId: string) => void;
}

export const UserTableRow = ({ 
  user, 
  onUpdateTier, 
  onUserDeleted 
}: UserTableRowProps) => {
  return (
    <TableRow key={user.id}>
      <TableCell className="font-medium">{user.email}</TableCell>
      <TableCell>{user.name || "-"}</TableCell>
      <TableCell>
        <SubscriptionCell user={user} />
      </TableCell>
      <TableCell>{user.eq_archetype || "Not set"}</TableCell>
      <TableCell><LastLoginCell user={user} /></TableCell>
      <TableCell><ChatActivityCell user={user} /></TableCell>
      <TableCell><TokenUsageCell user={user} /></TableCell>
      <TableCell>{user.onboarded ? "Yes" : "No"}</TableCell>
      <TableCell>
        <UserOperations 
          user={user}
          onUpdateTier={onUpdateTier}
          onUserDeleted={onUserDeleted}
        />
      </TableCell>
    </TableRow>
  );
};
