
import { useState } from "react";
import { SubscriptionTier, EQArchetype } from "@/types";
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

  // Correctly type eq_archetype by validating it against valid EQArchetype values
  const getValidEQArchetype = (archetype: string | undefined): EQArchetype | "Not set" => {
    const validArchetypes: EQArchetype[] = ["reflector", "activator", "regulator", "connector", "observer"];
    if (!archetype) return "Not set";
    return validArchetypes.includes(archetype as EQArchetype) ? archetype as EQArchetype : "Not set";
  };

  // Create a version of the user that conforms to the User type requirements
  const userForDialogs = {
    ...user,
    // Properly cast eq_archetype to the expected union type
    eq_archetype: getValidEQArchetype(user.eq_archetype),
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
