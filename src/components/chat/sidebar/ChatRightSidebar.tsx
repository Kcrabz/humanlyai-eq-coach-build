
import React from "react";
import { Sidebar, SidebarContent, useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { UserProfileSettings } from "./UserProfileSettings";

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
      <SidebarContent className="flex flex-col h-full p-4">
        <UserProfileSettings />
      </SidebarContent>
    </Sidebar>
  );
}
