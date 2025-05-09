
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
    if (!user.subscription_tier || tier === user.subscription_tier as SubscriptionTier) return;
    setIsUpdating(true);
    try {
      await onUpdateTier(user.id, tier);
    } finally {
      setIsUpdating(false);
    }
  };

  // Create a version of the user that conforms to the User type requirements
  const userForDialogs = {
    ...user,
    // Ensure eq_archetype is treated as EQArchetype | "Not set"
    eq_archetype: user.eq_archetype || "Not set",
    // Add any other required fields that might be missing
    subscription_tier: (user.subscription_tier || "free") as SubscriptionTier,
    onboarded: user.onboarded || false
  };

  return (
    <>
      <UserActionsMenu
        userSubscriptionTier={user.subscription_tier as SubscriptionTier}
        isUpdating={isUpdating}
        onViewDetails={() => setShowUserDetails(true)}
        onResetPassword={() => setIsResetDialogOpen(true)}
        onDeleteUser={() => setIsDeleteDialogOpen(true)}
        onUpdateTier={handleUpdateTier}
      />

      <UserDetailsDialog 
        user={userForDialogs}
        open={showUserDetails}
        onOpenChange={setShowUserDetails}
      />

      <ResetPasswordDialog
        user={userForDialogs}
        open={isResetDialogOpen}
        onOpenChange={setIsResetDialogOpen}
      />

      <DeleteUserDialog
        user={userForDialogs}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onUserDeleted={onUserDeleted}
      />
    </>
  );
};
