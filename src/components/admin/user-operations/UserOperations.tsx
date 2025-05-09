
import { UserOperationsProps } from "./types";
import { UserDetailsDialog } from "./dialogs/UserDetailsDialog";
import { ResetPasswordDialog } from "./dialogs/ResetPasswordDialog";
import { DeleteUserDialog } from "./dialogs/DeleteUserDialog";
import { UserActionsMenu } from "./menus/UserActionsMenu";
import { useUserDetails } from "./hooks/useUserDetails";
import { useResetPassword } from "./hooks/useResetPassword";
import { useDeleteUser } from "./hooks/useDeleteUser";
import { useSubscriptionUpdate } from "./hooks/useSubscriptionUpdate";

export const UserOperations = ({ user, onUpdateTier, onUserDeleted }: UserOperationsProps) => {
  const { showUserDetails, setShowUserDetails, userForDialogs } = useUserDetails(user);
  const { isResetDialogOpen, setIsResetDialogOpen } = useResetPassword();
  const { isDeleteDialogOpen, setIsDeleteDialogOpen } = useDeleteUser();
  const { isUpdating, handleUpdateTier } = useSubscriptionUpdate(
    onUpdateTier, 
    user.id, 
    user.subscription_tier
  );

  return (
    <>
      <UserActionsMenu
        userSubscriptionTier={user.subscription_tier as any}
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
