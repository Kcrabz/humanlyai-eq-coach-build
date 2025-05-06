
import { useState } from "react";
import { SubscriptionTier } from "@/types";
import { UserOperationsProps } from "./types";
import { UserDetailsDialog } from "./UserDetailsDialog";
import { ResetPasswordDialog } from "./ResetPasswordDialog";
import { DeleteUserDialog } from "./DeleteUserDialog";
import { UserActionsMenu } from "./UserActionsMenu";

export const UserOperations = ({ user, onUpdateTier, onUserDeleted }: UserOperationsProps) => {
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateTier = async (tier: SubscriptionTier) => {
    if (tier === user.subscription_tier) return;
    setIsUpdating(true);
    try {
      await onUpdateTier(user.id, tier);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <UserActionsMenu
        userSubscriptionTier={user.subscription_tier}
        isUpdating={isUpdating}
        onViewDetails={() => setShowUserDetails(true)}
        onResetPassword={() => setIsResetDialogOpen(true)}
        onDeleteUser={() => setIsDeleteDialogOpen(true)}
        onUpdateTier={handleUpdateTier}
      />

      <UserDetailsDialog 
        user={user}
        open={showUserDetails}
        onOpenChange={setShowUserDetails}
      />

      <ResetPasswordDialog
        user={user}
        open={isResetDialogOpen}
        onOpenChange={setIsResetDialogOpen}
      />

      <DeleteUserDialog
        user={user}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onUserDeleted={onUserDeleted}
      />
    </>
  );
};
