
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MoreHorizontal, Star, UserIcon } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { generateAvatar } from "@/lib/utils";

interface UserOperationsProps {
  user: User;
  onUpdateTier: (userId: string, tier: SubscriptionTier) => Promise<void>;
}

export const UserOperations = ({ user, onUpdateTier }: UserOperationsProps) => {
  const [showUserDetails, setShowUserDetails] = useState(false);
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
    </>
  );
};
