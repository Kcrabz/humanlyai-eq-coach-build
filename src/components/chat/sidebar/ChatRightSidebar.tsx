
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
      className="user-sidebar w-64 transition-all duration-300"
      data-state={open ? "open" : "closed"}
      data-mobile={isMobile ? "true" : "false"}
    >
      <SidebarContent className="flex flex-col h-full p-0">
        <RightSidebarContent />
      </SidebarContent>
    </Sidebar>
  );
}
