
import { User, SubscriptionTier } from "@/types";

export interface UserOperationsProps {
  user: User;
  onUpdateTier: (userId: string, tier: SubscriptionTier) => Promise<void>;
  onUserDeleted?: (userId: string) => void;
}

export interface DialogState {
  userDetails: boolean;
  resetPassword: boolean;
  deleteUser: boolean;
}
