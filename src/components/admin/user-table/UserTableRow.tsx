
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
  // Safe access of user data with fallbacks
  const userId = user?.id;
  const isValid = !!userId;
  
  // If we have an invalid user object, don't render the row
  if (!isValid) {
    return null;
  }
  
  // Use a default value if email is missing or invalid, sanitizing for safety
  const displayEmail = user.email && typeof user.email === 'string' && user.email !== 'Unknown' 
    ? user.email 
    : "Unknown email";
  
  return (
    <TableRow>
      <TableCell className="font-medium max-w-[200px] truncate" title={displayEmail}>{displayEmail}</TableCell>
      <TableCell className="max-w-[150px] truncate" title={user.name || "-"}>{user.name || "-"}</TableCell>
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
