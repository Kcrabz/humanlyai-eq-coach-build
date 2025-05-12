
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { UserAvatar } from "@/components/chat/components/UserAvatar";
import { MainNavigationLinks } from "./MainNavigationLinks";
import { UserAccountLinks } from "./UserAccountLinks";
import { UserEQArchetype } from "./UserEQArchetype";
import { UserBio } from "./UserBio";
import { LogoutButton } from "./LogoutButton";

export function RightSidebarContent() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-full">
      {/* User Profile Header */}
      <div className="p-4 flex flex-col items-center">
        <UserAvatar 
          user={user} 
          size="xl"
          className="h-16 w-16 mb-3"
        />
        <h3 className="font-medium text-base">{user?.name || 'User'}</h3>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
        
        {user?.subscription_tier && (
          <div className="mt-1">
            <span className="bg-humanly-pastel-mint/50 text-humanly-teal px-3 py-1 rounded-full text-xs">
              {user.subscription_tier.charAt(0).toUpperCase() + user.subscription_tier.slice(1)} Plan
            </span>
          </div>
        )}
      </div>

      <Separator />
      
      {/* Main Navigation */}
      <div className="px-4 py-3">
        <MainNavigationLinks />
      </div>
      
      <Separator />
      
      {/* User Account Section */}
      <div className="px-4 py-3">
        <UserAccountLinks />
      </div>
      
      <Separator className="mt-auto" />
      
      {/* User Archetype Card if available */}
      {user?.eq_archetype && (
        <div className="px-4 py-3">
          <UserEQArchetype />
        </div>
      )}
      
      {/* User Bio if available */}
      {user?.bio && (
        <>
          <Separator />
          <div className="px-4 py-3">
            <UserBio />
          </div>
        </>
      )}
      
      <Separator />
      
      {/* Logout Button */}
      <div className="p-4">
        <LogoutButton />
      </div>
    </div>
  );
}
