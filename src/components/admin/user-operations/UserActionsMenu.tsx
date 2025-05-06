
import { SubscriptionTier } from "@/types";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Star, UserIcon, Key, Trash2 } from "lucide-react";

interface UserActionsMenuProps {
  userSubscriptionTier: SubscriptionTier;
  isUpdating: boolean;
  onViewDetails: () => void;
  onResetPassword: () => void;
  onDeleteUser: () => void;
  onUpdateTier: (tier: SubscriptionTier) => void;
}

export const UserActionsMenu = ({
  userSubscriptionTier,
  isUpdating,
  onViewDetails,
  onResetPassword,
  onDeleteUser,
  onUpdateTier
}: UserActionsMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={onViewDetails}>
          <UserIcon className="mr-2 h-4 w-4" />
          View details
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={onResetPassword}>
          <Key className="mr-2 h-4 w-4" />
          Reset password
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={onDeleteUser}
          className="text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete user
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Change Subscription</DropdownMenuLabel>
        <DropdownMenuItem 
          disabled={userSubscriptionTier === "free" || isUpdating}
          onClick={() => onUpdateTier("free")}
        >
          Set to Free
        </DropdownMenuItem>
        <DropdownMenuItem 
          disabled={userSubscriptionTier === "basic" || isUpdating}
          onClick={() => onUpdateTier("basic")}
        >
          <Star className="mr-2 h-4 w-4" />
          Set to Basic
        </DropdownMenuItem>
        <DropdownMenuItem 
          disabled={userSubscriptionTier === "premium" || isUpdating}
          onClick={() => onUpdateTier("premium")}
        >
          <Star className="mr-2 h-4 w-4 text-amber-500" />
          Set to Premium
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
