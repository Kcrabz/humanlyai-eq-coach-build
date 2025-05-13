
import React from "react";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, useSidebar } from "@/components/ui/sidebar";
import { ChevronRight } from "lucide-react";
import { RightSidebarContent } from "./right/RightSidebarContent";
import { useIsMobile } from "@/hooks/use-mobile";

export function ChatRightSidebar() {
  const { open, setOpen } = useSidebar("right");
  const isMobile = useIsMobile();

  // Toggle sidebar on narrow screens
  const toggleSidebar = () => {
    setOpen(!open);
  };
  
  return (
    <Sidebar 
      side="right" 
      className={`w-80 transition-all duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      data-state={open ? "open" : "closed"}
      data-mobile={isMobile ? "true" : "false"}
    >
      <SidebarContent className="flex flex-col h-full">
        {/* Header with close button - Improved alignment */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="w-4"></div> {/* Empty space to maintain alignment */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="h-8 w-8 p-0"
          >
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
