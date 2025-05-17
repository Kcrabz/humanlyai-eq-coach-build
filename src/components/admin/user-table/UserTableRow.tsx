
import { memo } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { UserOperations } from "../user-operations";
import { SubscriptionTier } from "@/types";
import { UserTableData } from "@/hooks/useUserManagement/types";
import { LastLoginCell } from "./cells/LastLoginCell";
import { ChatActivityCell } from "./cells/ChatActivityCell";
import { TokenUsageCell } from "./cells/TokenUsageCell";
import { SubscriptionCell } from "./cells/SubscriptionCell";
import { ArchetypeCell } from "./cells/ArchetypeCell";

interface UserTableRowProps {
  user: UserTableData;
  onUpdateTier: (userId: string, tier: SubscriptionTier) => Promise<void>;
  onUserDeleted?: (userId: string) => void;
}

const UserTableRowComponent = ({ 
  user, 
  onUpdateTier, 
  onUserDeleted 
}: UserTableRowProps) => {
  // Use a default value if email is missing or invalid
  const displayEmail = user.email && user.email !== 'Unknown' ? user.email : "Unknown email";
  
  return (
    <TableRow>
      <TableCell className="font-medium">{displayEmail}</TableCell>
      <TableCell>{user.name || "-"}</TableCell>
      <TableCell>
        <SubscriptionCell user={user} />
      </TableCell>
      <TableCell><ArchetypeCell user={user} /></TableCell>
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

export const UserTableRow = memo(UserTableRowComponent);
