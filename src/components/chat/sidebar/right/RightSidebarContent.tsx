
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { UserAvatar } from "@/components/chat/components/UserAvatar";
import { Link } from "react-router-dom";
import { 
  Settings, 
  LayoutDashboard, 
  CreditCard,
  Brain,
  Shield,
  LogOut
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
import { useChatMemory } from "@/context/ChatMemoryContext";
import { Card } from "@/components/ui/card";

export function RightSidebarContent() {
  const { user, logout } = useAuth();
  const { isAdmin } = useAdminCheck();
  const { memoryStats, toggleMemory } = useChatMemory();
  const [showMemoryDialog, setShowMemoryDialog] = useState(false);

  const openMemoryDialog = () => {
    setShowMemoryDialog(true);
  };

  return (
    <div className="flex flex-col h-full bg-white p-4">
      {/* User Profile Header */}
      <div className="flex flex-col items-center mb-4">
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

      <Separator className="mb-4" />
      
      {/* Memory Card */}
      <Card 
        className="p-3 mb-4 bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-humanly-pastel-lavender/60 cursor-pointer transition-all"
        onClick={openMemoryDialog}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="h-4 w-4 mr-2 text-humanly-indigo" />
            <h3 className="font-medium text-sm text-humanly-indigo">Memory</h3>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-5 w-5 p-0 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              openMemoryDialog();
            }}
          >
            <span className="text-xs">→</span>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {memoryStats.totalMemories > 0 
            ? `${memoryStats.totalMemories} memories saved` 
            : "No memories saved"}
        </p>
      </Card>
      
      {/* Memory Dialog */}
      <Dialog open={showMemoryDialog} onOpenChange={setShowMemoryDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Memory Settings</DialogTitle>
          </DialogHeader>
          <MemorySettings />
        </DialogContent>
      </Dialog>
      
      {/* EQ Archetype Section - Styled as shown in image */}
      {user?.eq_archetype && (
        <div 
          className="bg-humanly-pastel-lavender/30 rounded-lg p-3 mb-4 cursor-pointer"
          onClick={() => window.location.href = "/progress?tab=eq-journey"}
        >
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-humanly-indigo/20 flex items-center justify-center text-humanly-indigo">
              {user.eq_archetype.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-medium text-sm">{user.eq_archetype.charAt(0).toUpperCase() + user.eq_archetype.slice(1)}</h3>
              <p className="text-xs text-muted-foreground">EQ Archetype</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Navigation Links - Styled as shown in image */}
      <div className="space-y-1 mb-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-sm h-9"
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
            className="w-full justify-start text-sm h-9"
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
          className="w-full justify-start text-sm h-9"
          asChild
        >
          <Link to="/subscription">
            <CreditCard className="h-4 w-4 mr-2" />
            Your Plan
          </Link>
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start text-sm h-9"
          asChild
        >
          <Link to="/settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Link>
        </Button>
      </div>
      
      <Separator />
      
      {/* Logout Button - Styled as shown in image */}
      <div className="mt-auto pt-4">
        <Button
          variant="outline"
          className="w-full justify-start h-9 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          onClick={logout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log out
        </Button>
      </div>
    </div>
  );
}
