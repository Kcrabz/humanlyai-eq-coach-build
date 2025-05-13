
import React from "react";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, useSidebar } from "@/components/ui/sidebar";
import { ChevronRight } from "lucide-react";
import { RightSidebarContent } from "./right/RightSidebarContent";

export function ChatRightSidebar() {
  const { open, setOpen } = useSidebar("right");

  // Toggle sidebar on narrow screens
  const toggleSidebar = () => {
    setOpen(!open);
  };
  
  return (
    <Sidebar side="right" className="w-80">
      <SidebarContent className="flex flex-col h-full divide-y">
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4">
          <h2 className="font-medium text-sm">Your Account</h2>
          <Button variant="ghost" size="sm" onClick={toggleSidebar}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <RightSidebarContent />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
