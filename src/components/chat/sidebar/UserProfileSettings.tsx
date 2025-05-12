
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";

export const UserProfileSettings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Navigate to settings page
  const handleEditProfile = () => {
    navigate("/settings");
  };

  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Avatar className="h-16 w-16 mr-4">
          <AvatarImage src={user.avatar_url || "/images/default-avatar.png"} alt="User avatar" />
          <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">{user.name || "User"}</h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {user.subscription_tier || "Free"} Plan
          </p>
        </div>
      </div>

      <Separator />

      {user.eq_archetype && (
        <div>
          <h4 className="text-sm font-medium mb-1">Your EQ Archetype</h4>
          <p className="text-sm bg-primary/10 p-2 rounded">
            {user.eq_archetype}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <h4 className="text-sm font-medium mb-1">Account actions</h4>
        <div className="flex flex-col gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleEditProfile}
            className="justify-start"
          >
            Edit Profile
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/progress")}
            className="justify-start"
          >
            View Progress
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSignOut}
            className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
};
