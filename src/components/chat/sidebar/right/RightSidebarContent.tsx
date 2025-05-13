
import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { UserAvatar } from "@/components/chat/components/UserAvatar";
import { Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  Shield, 
  Brain,
  CreditCard,
  Settings,
  LogOut
} from "lucide-react";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MemorySettings } from "@/components/chat/memory/MemorySettings";
import { useChatMemory } from "@/context/ChatMemoryContext";

export function RightSidebarContent() {
  const { user, logout } = useAuth();
  const { isAdmin } = useAdminCheck();
  const { memoryStats, toggleMemory } = useChatMemory();
  const [showMemoryDialog, setShowMemoryDialog] = React.useState(false);

  const openMemoryDialog = () => {
    setShowMemoryDialog(true);
  };

  return (
    <div className="flex flex-col h-full p-5">
      {/* User Profile Header - Styled to match screenshot */}
      <div className="flex flex-col items-center mb-8">
        <UserAvatar 
          userId={user?.id}
          name={user?.name || 'User'}
          avatarUrl={user?.avatar_url}
          className="h-16 w-16 mb-3"
        />
        <h3 className="font-semibold text-base">{user?.name || 'User'}</h3>
        <p className="text-sm text-gray-500">{user?.email}</p>
        
        {user?.subscription_tier && (
          <div className="mt-1.5">
            <span className="bg-humanly-pastel-mint/50 text-humanly-teal px-3 py-1 rounded-full text-xs">
              {user.subscription_tier.charAt(0).toUpperCase() + user.subscription_tier.slice(1)} Plan
            </span>
          </div>
        )}
      </div>
      
      {/* Navigation Links - Styled to match screenshot exactly */}
      <div className="space-y-1 mb-6">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 font-normal text-sm h-9"
          asChild
        >
          <Link to="/dashboard">
            <LayoutDashboard className="h-4 w-4 mr-3" />
            Dashboard
          </Link>
        </Button>
        
        {isAdmin && (
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-700 font-normal text-sm h-9"
            asChild
          >
            <Link to="/admin">
              <Shield className="h-4 w-4 mr-3" />
              Admin
            </Link>
          </Button>
        )}
        
        {/* Memory button - Styled to match screenshot */}
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 font-normal text-sm h-9"
          onClick={openMemoryDialog}
        >
          <Brain className="h-4 w-4 mr-3" />
          Memory
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 font-normal text-sm h-9"
          asChild
        >
          <Link to="/subscription">
            <CreditCard className="h-4 w-4 mr-3" />
            Your Plan
          </Link>
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 font-normal text-sm h-9"
          asChild
        >
          <Link to="/settings">
            <Settings className="h-4 w-4 mr-3" />
            Settings
          </Link>
        </Button>
      </div>
      
      {/* EQ Archetype Section - Styled to match screenshot */}
      {user?.eq_archetype && (
        <div 
          className="bg-humanly-pastel-lavender/30 rounded-lg p-3 mb-6 cursor-pointer"
          onClick={() => window.location.href = "/progress?tab=eq-journey"}
        >
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-humanly-indigo flex items-center justify-center text-white">
              {user.eq_archetype.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-medium text-sm">{user.eq_archetype.charAt(0).toUpperCase() + user.eq_archetype.slice(1)}</h3>
              <p className="text-xs text-gray-500">EQ Archetype</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Memory Dialog */}
      <Dialog open={showMemoryDialog} onOpenChange={setShowMemoryDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Memory Settings</DialogTitle>
          </DialogHeader>
          <MemorySettings />
        </DialogContent>
      </Dialog>
      
      {/* Logout Button - Styled to match screenshot */}
      <div className="mt-auto pt-4">
        <Button
          variant="outline"
          className="w-full justify-start h-9 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          onClick={logout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Log out
        </Button>
      </div>
    </div>
  );
}
