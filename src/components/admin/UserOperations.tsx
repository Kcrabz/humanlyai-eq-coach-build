
import { useState } from "react";
import { User, SubscriptionTier } from "@/types";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Star, UserIcon, Key, Trash2, AlertCircle } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { generateAvatar } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserOperationsProps {
  user: User;
  onUpdateTier: (userId: string, tier: SubscriptionTier) => Promise<void>;
  onUserDeleted?: (userId: string) => void;
}

export const UserOperations = ({ user, onUpdateTier, onUserDeleted }: UserOperationsProps) => {
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpdateTier = async (tier: SubscriptionTier) => {
    if (tier === user.subscription_tier) return;
    setIsUpdating(true);
    try {
      await onUpdateTier(user.id, tier);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user.email) {
      toast.error("Cannot reset password", { description: "User email is unknown" });
      return;
    }
    
    setIsProcessing(true);
    try {
      const response = await supabase.functions.invoke('admin-reset-password', {
        body: { userId: user.id, email: user.email }
      });

      if (response.error) {
        throw new Error(response.error);
      }

      toast.success("Password reset email sent", { 
        description: `A password reset link has been sent to ${user.email}` 
      });
      setIsResetDialogOpen(false);
    } catch (error) {
      console.error("Failed to reset password:", error);
      toast.error("Failed to reset password", { 
        description: error instanceof Error ? error.message : "An unexpected error occurred" 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = async () => {
    setIsProcessing(true);
    try {
      const response = await supabase.functions.invoke('admin-delete-user', {
        body: { userId: user.id }
      });

      if (response.error) {
        throw new Error(response.error);
      }

      toast.success("User deleted successfully");
      setIsDeleteDialogOpen(false);
      
      // Update parent component state
      if (onUserDeleted) {
        onUserDeleted(user.id);
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user", { 
        description: error instanceof Error ? error.message : "An unexpected error occurred" 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setShowUserDetails(true)}>
            <UserIcon className="mr-2 h-4 w-4" />
            View details
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setIsResetDialogOpen(true)}>
            <Key className="mr-2 h-4 w-4" />
            Reset password
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete user
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuLabel>Change Subscription</DropdownMenuLabel>
          <DropdownMenuItem 
            disabled={user.subscription_tier === "free" || isUpdating}
            onClick={() => handleUpdateTier("free")}
          >
            Set to Free
          </DropdownMenuItem>
          <DropdownMenuItem 
            disabled={user.subscription_tier === "basic" || isUpdating}
            onClick={() => handleUpdateTier("basic")}
          >
            <Star className="mr-2 h-4 w-4" />
            Set to Basic
          </DropdownMenuItem>
          <DropdownMenuItem 
            disabled={user.subscription_tier === "premium" || isUpdating}
            onClick={() => handleUpdateTier("premium")}
          >
            <Star className="mr-2 h-4 w-4 text-amber-500" />
            Set to Premium
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User details dialog */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete information about this user
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden">
                <AspectRatio ratio={1} className="bg-muted">
                  <img 
                    src={user.avatar_url || generateAvatar(user.email)} 
                    alt={user.name || "User"} 
                    className="object-cover"
                  />
                </AspectRatio>
              </div>
              <div>
                <h3 className="font-medium">{user.name || "No name set"}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex mt-1">
                  <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                    {user.subscription_tier || "free"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">EQ Archetype</h4>
              <p>{user.eq_archetype || "Not set"}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Coaching Mode</h4>
              <p>{user.coaching_mode || "Not set"}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Onboarding Status</h4>
              <p>{user.onboarded ? "Completed" : "Not completed"}</p>
            </div>

            {user.bio && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Bio</h4>
                <p className="text-sm">{user.bio}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Password reset confirmation dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset User Password</DialogTitle>
            <DialogDescription>
              This will send a password reset email to the user.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to send a password reset email to:</p>
            <p className="font-medium mt-2">{user.email || "Unknown email"}</p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsResetDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleResetPassword} 
              disabled={isProcessing || !user.email}
            >
              {isProcessing ? "Sending..." : "Send Reset Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete user confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete User Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action is permanent and cannot be undone. This will delete the user's account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <p>Are you sure you want to permanently delete this user?</p>
            <div className="mt-2 p-3 bg-muted rounded-md">
              <p className="font-medium">{user.name || "Unnamed user"}</p>
              <p className="text-sm text-muted-foreground">{user.email || "Unknown email"}</p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteUser();
              }}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
