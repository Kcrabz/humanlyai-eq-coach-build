
import { useState } from "react";
import { User } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ResetPasswordDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ResetPasswordDialog = ({ user, open, onOpenChange }: ResetPasswordDialogProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

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
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to reset password:", error);
      toast.error("Failed to reset password", { 
        description: error instanceof Error ? error.message : "An unexpected error occurred" 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            onClick={() => onOpenChange(false)}
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
  );
};
