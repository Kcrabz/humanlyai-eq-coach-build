
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { UserAvatar } from "@/components/chat/components/UserAvatar";
import { Link } from "react-router-dom";
import { 
  Settings, 
  UserCircle, 
  CreditCard, 
  MemoryStick,
  Bell,
  LayoutDashboard,
  Share2,
  Shield
} from "lucide-react";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { MemorySettings } from "@/components/chat/memory/MemorySettings";
import { LogoutButton } from "./LogoutButton";

export function RightSidebarContent() {
  const { user, logout } = useAuth();
  const { isAdmin } = useAdminCheck();

  return (
    <div className="flex flex-col h-full">
      {/* User Profile Header */}
      <div className="p-4 flex flex-col items-center">
        <UserAvatar 
          userId={user?.id}
          name={user?.name || 'User'}
          avatarUrl={user?.avatar_url}
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
      <div className="px-4 py-3 space-y-1">
        <h3 className="text-sm font-medium mb-2">Your Account</h3>
        
        <Button
          variant="ghost"
          className="w-full justify-start text-sm"
          asChild
        >
          <Link to="/dashboard">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Dashboard
          </Link>
        </Button>
        
        {isAdmin && (
          <Button
            variant="ghost"
            className="w-full justify-start text-sm"
            asChild
          >
            <Link to="/admin">
              <Shield className="h-4 w-4 mr-2" />
              Admin
            </Link>
          </Button>
        )}
        
        <Button
          variant="ghost"
          className="w-full justify-start text-sm"
          asChild
        >
          <Link to="/settings">
            <UserCircle className="h-4 w-4 mr-2" />
            Memory
          </Link>
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start text-sm"
          asChild
        >
          <Link to="/subscription">
            <CreditCard className="h-4 w-4 mr-2" />
            Your Plan
          </Link>
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start text-sm"
          asChild
        >
          <Link to="/settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Link>
        </Button>
      </div>
      
      <Separator />
      
      {/* EQ Archetype Section */}
      {user?.eq_archetype && (
        <div className="px-4 py-3">
          <Link to="/progress?tab=eq-journey" className="group">
            <h3 className="text-sm font-medium text-humanly-indigo mb-2 group-hover:text-humanly-indigo-dark">Your EQ Archetype</h3>
            <div className="flex items-center gap-2 p-2 rounded-md bg-humanly-pastel-lavender/20">
              <div className="h-8 w-8 rounded-full bg-humanly-indigo/20 flex items-center justify-center text-humanly-indigo">
                {user.eq_archetype.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-sm">{user.eq_archetype.charAt(0).toUpperCase() + user.eq_archetype.slice(1)}</span>
            </div>
          </Link>
        </div>
      )}
      
      {/* User Bio if available */}
      {user?.bio && (
        <>
          <Separator />
          <div className="px-4 py-3">
            <Link to="/settings?tab=profile" className="group">
              <h3 className="text-sm font-medium text-humanly-indigo mb-2 group-hover:text-humanly-indigo-dark">Your Bio</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{user.bio}</p>
            </Link>
          </div>
        </>
      )}
      
      <Separator />
      
      {/* Memory Button with Dialog */}
      <div className="px-4 py-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm"
            >
              <MemoryStick className="h-4 w-4 mr-2" />
              Memory
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Memory Settings</DialogTitle>
            </DialogHeader>
            <MemorySettings />
          </DialogContent>
        </Dialog>
      </div>
      
      <Separator />
      
      {/* Logout Button */}
      <div className="mt-auto px-4 py-3">
        <LogoutButton />
      </div>
    </div>
  );
}
