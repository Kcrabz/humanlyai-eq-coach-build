
import React, { useState } from "react";
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
import { ChatHistorySidebar } from "../ChatHistorySidebar";
import { Separator } from "@/components/ui/separator";

export function RightSidebarContent() {
  const { user, logout } = useAuth();
  const { isAdmin } = useAdminCheck();
  const { memoryStats, toggleMemory } = useChatMemory();
  const [showMemoryDialog, setShowMemoryDialog] = useState(false);

  const openMemoryDialog = () => {
    setShowMemoryDialog(true);
  };

  return (
    <div className="flex flex-col h-full p-4">
      {/* User Profile Header - Styled to match screenshot */}
      <div className="flex flex-col items-center mb-6">
        <UserAvatar 
          userId={user?.id}
          name={user?.name || 'User'}
          avatarUrl={user?.avatar_url}
          className="h-14 w-14 mb-2"
        />
        <h3 className="font-semibold text-base">{user?.name || 'User'}</h3>
        <p className="text-xs text-gray-500">{user?.email}</p>
        
        {user?.subscription_tier && (
          <div className="mt-1">
            <span className="bg-humanly-pastel-mint/50 text-humanly-teal px-2 py-0.5 rounded-full text-xs">
              {user.subscription_tier.charAt(0).toUpperCase() + user.subscription_tier.slice(1)} Plan
            </span>
          </div>
        )}
      </div>
      
      {/* EQ Archetype Section - More compact styling */}
      {user?.eq_archetype && (
        <div 
          className="bg-humanly-pastel-lavender/30 rounded-lg p-2.5 mb-4 cursor-pointer"
          onClick={() => window.location.href = "/progress?tab=eq-journey"}
        >
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-humanly-indigo flex items-center justify-center text-white text-xs">
              {user.eq_archetype.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-medium text-xs">{user.eq_archetype.charAt(0).toUpperCase() + user.eq_archetype.slice(1)}</h3>
              <p className="text-xs text-gray-500">EQ Archetype</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Recent Conversations Section (newly added) */}
      <div className="mb-4">
        <h3 className="text-xs font-medium text-muted-foreground uppercase mb-2">Recent Conversations</h3>
        <ChatHistorySidebar />
      </div>
      
      <Separator className="my-3" />
      
      {/* Navigation Links - More compact styling */}
      <div className="space-y-0.5 mb-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 font-normal text-xs h-8"
          asChild
        >
          <Link to="/dashboard">
            <LayoutDashboard className="h-3.5 w-3.5 mr-2" />
            Dashboard
          </Link>
        </Button>
        
        {isAdmin && (
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-700 font-normal text-xs h-8"
            asChild
          >
            <Link to="/admin">
              <Shield className="h-3.5 w-3.5 mr-2" />
              Admin
            </Link>
          </Button>
        )}
        
        {/* Memory button - More compact styling */}
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 font-normal text-xs h-8"
          onClick={openMemoryDialog}
        >
          <Brain className="h-3.5 w-3.5 mr-2" />
          Memory
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 font-normal text-xs h-8"
          asChild
        >
          <Link to="/subscription">
            <CreditCard className="h-3.5 w-3.5 mr-2" />
            Your Plan
          </Link>
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 font-normal text-xs h-8"
          asChild
        >
          <Link to="/settings">
            <Settings className="h-3.5 w-3.5 mr-2" />
            Settings
          </Link>
        </Button>
      </div>
      
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
      <div className="mt-auto pt-2">
        <Button
          variant="outline"
          className="w-full justify-start h-8 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          onClick={logout}
        >
          <LogOut className="h-3.5 w-3.5 mr-2" />
          Log out
        </Button>
      </div>
    </div>
  );
}
