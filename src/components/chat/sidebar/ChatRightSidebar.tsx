
import React from "react";
import { Sidebar, SidebarContent, useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { RightSidebarContent } from "./right/RightSidebarContent";

export function ChatRightSidebar() {
  const { open } = useSidebar("right");
  const isMobile = useIsMobile();
  
  return (
    <Sidebar 
      side="right" 
      className={`w-80 transition-all duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      data-state={open ? "open" : "closed"}
      data-mobile={isMobile ? "true" : "false"}
    >
      <SidebarContent className="flex flex-col h-full">
        {/* Header without close button */}
        <div className="border-b border-gray-100">
          {/* Empty header - no content */}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <RightSidebarContent />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
