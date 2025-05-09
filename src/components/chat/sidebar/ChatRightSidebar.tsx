
import { useAuth } from "@/context/AuthContext";
import { 
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar
} from "@/components/ui/sidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CSSProperties } from "react";

// Import our component files
import { UserProfile } from "./right/UserProfile";
import { MainNavigationLinks } from "./right/MainNavigationLinks";
import { UserAccountLinks } from "./right/UserAccountLinks";
import { UserEQArchetype } from "./right/UserEQArchetype";
import { UserBio } from "./right/UserBio";
import { LogoutButton } from "./right/LogoutButton";
import { useIsMobile } from "@/hooks/use-mobile";

// Sidebar trigger button for the right sidebar
export function ChatRightSidebarTrigger() {
  // Specifically use the right sidebar context
  const { toggleSidebar, open } = useSidebar("right");
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className={`h-9 w-9 flex items-center justify-center rounded-full bg-humanly-pastel-lavender/30 text-humanly-indigo hover:bg-humanly-pastel-lavender/50 transition-colors duration-300 ${
        open ? 'bg-humanly-pastel-lavender/50' : ''
      }`}
      aria-label="Toggle User Menu"
      onClick={() => toggleSidebar()}
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}

export function ChatRightSidebar() {
  const { user } = useAuth();
  // Specifically use the right sidebar context
  const { open, toggleSidebar } = useSidebar("right");
  const isMobile = useIsMobile();
  
  if (!user) return null;
  
  // For mobile, use offcanvas style with overlay
  // For desktop, use fixed sidebar that pushes content
  const sidebarStyle: CSSProperties = isMobile ? {
    position: 'fixed',
    top: 0,
    right: open ? '0' : '-100%',
    height: '100%',
    zIndex: 50,
    transition: 'right 0.3s ease',
    boxShadow: open ? '0 0 10px rgba(0,0,0,0.1)' : 'none'
  } : {
    width: open ? '16rem' : '0',
    minWidth: open ? '16rem' : '0',
    transition: 'width 0.3s ease, min-width 0.3s ease'
  };

  return (
    <Sidebar 
      side="right" 
      variant="sidebar" 
      collapsible="offcanvas"
      className={`user-sidebar`}
      style={sidebarStyle}
      data-state={open ? "open" : "closed"}
      data-mobile={isMobile ? "true" : "false"}
    >
      <SidebarHeader className="p-4">
        <UserProfile />
      </SidebarHeader>
      
      <SidebarContent className="p-3">
        {/* Only show main navigation links on mobile, since desktop has the CollapsibleMenu */}
        {isMobile && <MainNavigationLinks />}
        
        {isMobile && <Separator className="my-3" />}
        
        {/* User Profile Links */}
        <UserAccountLinks />
        
        <Separator className="my-3" />
        
        <UserEQArchetype />
        
        <UserBio />
      </SidebarContent>
      
      <SidebarFooter className="p-3">
        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  );
}
