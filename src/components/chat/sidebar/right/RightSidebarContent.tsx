
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
import { ARCHETYPES } from "@/lib/constants";
import { EQArchetype } from "@/types";

export function RightSidebarContent() {
  const { user, logout } = useAuth();
  const { isAdmin } = useAdminCheck();
  const { memoryStats, toggleMemory } = useChatMemory();
  const [showMemoryDialog, setShowMemoryDialog] = useState(false);
  const [showArchetypeDialog, setShowArchetypeDialog] = useState(false);

  const openMemoryDialog = () => {
    setShowMemoryDialog(true);
  };

  const handleArchetypeClick = () => {
    setShowArchetypeDialog(true);
  };

  const archetype = user?.eq_archetype ? ARCHETYPES[user.eq_archetype as EQArchetype] : null;
  
  return (
    <div className="flex flex-col h-full p-5">
      {/* User Profile Header */}
      <div className="flex flex-col items-center mb-8">
        <UserAvatar 
          userId={user?.id}
          name={user?.name || 'User'}
          avatarUrl={user?.avatar_url}
          className="h-16 w-16 mb-3"
        />
        <h3 className="font-semibold text-lg">{user?.name || 'User'}</h3>
        <p className="text-sm text-gray-500">{user?.email}</p>
        
        {user?.subscription_tier && (
          <div className="mt-2">
            <span className="bg-humanly-pastel-mint/50 text-humanly-teal px-3 py-1 rounded-full text-sm">
              {user.subscription_tier.charAt(0).toUpperCase() + user.subscription_tier.slice(1)} Plan
            </span>
          </div>
        )}
      </div>
      
      {/* EQ Archetype Section */}
      {user?.eq_archetype && archetype && (
        <div 
          className="bg-humanly-pastel-lavender/30 rounded-lg p-4 mb-6 cursor-pointer hover:bg-humanly-pastel-lavender/40 transition-colors"
          onClick={handleArchetypeClick}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-humanly-indigo flex items-center justify-center text-white text-lg">
              {archetype.icon || user.eq_archetype.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-medium text-base">{user.eq_archetype.charAt(0).toUpperCase() + user.eq_archetype.slice(1)}</h3>
              <p className="text-sm text-gray-600">EQ Archetype</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Navigation Links */}
      <div className="space-y-1.5 mb-6">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 font-medium text-sm h-10"
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
            className="w-full justify-start text-gray-700 font-medium text-sm h-10"
            asChild
          >
            <Link to="/admin">
              <Shield className="h-4 w-4 mr-3" />
              Admin
            </Link>
          </Button>
        )}
        
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 font-medium text-sm h-10"
          onClick={openMemoryDialog}
        >
          <Brain className="h-4 w-4 mr-3" />
          Memory
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 font-medium text-sm h-10"
          asChild
        >
          <Link to="/subscription">
            <CreditCard className="h-4 w-4 mr-3" />
            Your Plan
          </Link>
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 font-medium text-sm h-10"
          asChild
        >
          <Link to="/settings">
            <Settings className="h-4 w-4 mr-3" />
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
      
      {/* EQ Archetype Dialog */}
      <Dialog open={showArchetypeDialog} onOpenChange={setShowArchetypeDialog}>
        <DialogContent className="sm:max-w-[500px] bg-[#FDE1C3]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <span>{archetype?.icon}</span>
              <span>{user?.eq_archetype?.charAt(0).toUpperCase() + user?.eq_archetype?.slice(1)} Archetype</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-base">
              {archetype?.description || "You're highly self-aware and introspective, with a deep understanding of your inner emotional landscape."}
            </p>
            
            <div>
              <h4 className="font-medium text-base mb-2">Your Strengths:</h4>
              <ul className="space-y-2">
                {archetype?.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </div>
                    <span className="text-base">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-base mb-2">Growth Areas:</h4>
              <ul className="space-y-2">
                {archetype?.growthAreas.map((area, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="h-5 w-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                      →
                    </div>
                    <span className="text-base">{area}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {archetype?.microPractice && (
              <div className="bg-white/50 p-4 rounded-md">
                <h4 className="font-medium text-base mb-1">Try This Today:</h4>
                <p className="text-base">{archetype?.microPractice}</p>
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setShowArchetypeDialog(false)}
                className="text-base"
              >
                Close
              </Button>
              <Button 
                onClick={() => {
                  setShowArchetypeDialog(false);
                  window.location.href = "/progress?tab=eq-journey";
                }}
                className="bg-humanly-indigo text-white text-base"
              >
                View Full Journey
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Logout Button */}
      <div className="mt-auto pt-4">
        <Button
          variant="outline"
          className="w-full justify-start h-10 text-base text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          onClick={logout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Log out
        </Button>
      </div>
    </div>
  );
}
