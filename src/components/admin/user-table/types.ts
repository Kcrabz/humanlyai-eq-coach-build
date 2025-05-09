
import { SubscriptionTier } from "@/types";
import { UserTableData } from "@/hooks/useUserManagement/types";

export interface UserTableProps {
  users: UserTableData[];
  isLoading: boolean;
  onUpdateTier: (userId: string, tier: SubscriptionTier) => Promise<void>;
  onUserDeleted?: (userId: string) => void;
}

export interface UserTableCellProps {
  user: UserTableData;
}
