
import { SubscriptionTier } from "@/types";
import { UserTableData } from "@/hooks/useUserManagement/types";

export interface UserOperationsProps {
  user: UserTableData;
  onUpdateTier: (userId: string, tier: SubscriptionTier) => Promise<void>;
  onUserDeleted?: (userId: string) => void;
}

export interface DialogState {
  userDetails: boolean;
  resetPassword: boolean;
  deleteUser: boolean;
}
