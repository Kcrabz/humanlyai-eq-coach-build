
import { useState } from "react";
import { User } from "@/types";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DeleteUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserDeleted?: (userId: string) => void;
}

export const DeleteUserDialog = ({ user, open, onOpenChange, onUserDeleted }: DeleteUserDialogProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

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
      onOpenChange(false);
      
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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
  );
};
