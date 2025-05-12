
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Sidebar, SidebarContent, useSidebar } from "@/components/ui/sidebar";
import { ChevronRight, User, Settings, Brain } from "lucide-react";
import { UserProfileSettings } from "@/components/chat/sidebar/UserProfileSettings";
import { GeneralSettings } from "@/components/chat/sidebar/GeneralSettings";
import { MemorySettings } from "@/components/chat/memory/MemorySettings";

// Tabs enum for section navigation
enum SidebarTab {
  PROFILE = "profile",
  SETTINGS = "settings",
  MEMORY = "memory"
}

export function ChatRightSidebar() {
  const { user } = useAuth();
  const { open, setOpen } = useSidebar("right");
  const [activeTab, setActiveTab] = useState<SidebarTab>(SidebarTab.PROFILE);

  // Toggle sidebar on narrow screens
  const toggleSidebar = () => {
    setOpen(!open);
  };
  
  // Function to change active tab
  const changeTab = (tab: SidebarTab) => {
    setActiveTab(tab);
  };
  
  // Check if memory features are available based on subscription tier
  const hasMemoryFeatures = user?.subscription_tier !== 'free';

  return (
    <Sidebar side="right" sizeClass="w-80">
      <SidebarContent className="flex flex-col h-full divide-y">
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4">
          <h2 className="font-medium">Settings</h2>
          <Button variant="ghost" size="sm" onClick={toggleSidebar}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Tab navigation */}
        <div className="border-b">
          <div className="flex">
            <Button
              variant="ghost"
              className={`flex-1 rounded-none ${
                activeTab === SidebarTab.PROFILE
                  ? "border-b-2 border-primary"
                  : ""
              }`}
              onClick={() => changeTab(SidebarTab.PROFILE)}
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button
              variant="ghost"
              className={`flex-1 rounded-none ${
                activeTab === SidebarTab.SETTINGS
                  ? "border-b-2 border-primary"
                  : ""
              }`}
              onClick={() => changeTab(SidebarTab.SETTINGS)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="ghost"
              className={`flex-1 rounded-none ${
                activeTab === SidebarTab.MEMORY
                  ? "border-b-2 border-primary"
                  : ""
              }`}
              onClick={() => changeTab(SidebarTab.MEMORY)}
            >
              <Brain className="h-4 w-4 mr-2" />
              Memory
            </Button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === SidebarTab.PROFILE && (
            <UserProfileSettings />
          )}
          {activeTab === SidebarTab.SETTINGS && (
            <GeneralSettings />
          )}
          {activeTab === SidebarTab.MEMORY && (
            <MemorySettings />
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
