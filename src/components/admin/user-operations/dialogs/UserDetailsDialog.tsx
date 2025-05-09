
import { User } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { generateAvatar } from "@/lib/utils";

interface UserDetailsDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserDetailsDialog = ({ user, open, onOpenChange }: UserDetailsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
  );
};
