
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

// Import our new component files
import { UserProfile } from "./right/UserProfile";
import { MainNavigationLinks } from "./right/MainNavigationLinks";
import { UserAccountLinks } from "./right/UserAccountLinks";
import { UserEQArchetype } from "./right/UserEQArchetype";
import { UserBio } from "./right/UserBio";
import { LogoutButton } from "./right/LogoutButton";

// Sidebar trigger button for the right sidebar
export function ChatRightSidebarTrigger() {
  // Specifically use the right sidebar context
  const { toggleSidebar } = useSidebar("right");
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-9 w-9 flex items-center justify-center rounded-full bg-humanly-pastel-lavender/30 text-humanly-indigo hover:bg-humanly-pastel-lavender/50 transition-colors duration-300" 
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
  const { open, setOpen, isMobile } = useSidebar("right");
  
  if (!user) return null;
  
  return (
    <Sidebar 
      side="right" 
      variant="sidebar" 
      collapsible="offcanvas"
      className="user-sidebar"
    >
      <SidebarHeader className="p-4">
        <UserProfile />
      </SidebarHeader>
      
      <SidebarContent className="p-3">
        {/* Main Navigation Links */}
        <MainNavigationLinks />
        
        <Separator className="my-3" />
        
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
