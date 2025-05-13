
import { useAuth } from "@/context/AuthContext";
import { ExternalLink, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar
} from "@/components/ui/sidebar";

// Import our sidebar components
import { ConversationStarters } from "./ConversationStarters";
import { ProgressTracker } from "./ProgressTracker";
import { DailyChallenge } from "./DailyChallenge";
import { Separator } from "@/components/ui/separator";

export function EnhancedChatSidebar() {
  const { user } = useAuth();
  const { open } = useSidebar("left");
  
  // Remove the effect that forces the sidebar to collapse by default
  // This allows the sidebar to respond to user interactions properly
  
  if (!user) return null;
  
  return (
    <>
      {/* The sidebar itself */}
      <Sidebar 
        side="left" 
        variant="sidebar" 
        collapsible="offcanvas"
        className="zen-sidebar transition-all duration-300"
        data-state={open ? "open" : "closed"}
      >
        <SidebarRail className="hover:bg-humanly-pastel-lavender/20 z-30" />
        
        <SidebarHeader>
          <div className="mb-1 p-1">
            <h2 className="font-medium text-base bg-gradient-to-r from-humanly-indigo to-humanly-teal bg-clip-text text-transparent flex items-center gap-2">
              <PanelLeft className="h-4 w-4 text-humanly-indigo" />
              EQ Coach
            </h2>
            <p className="text-xs text-muted-foreground">
              Daily practice for emotional intelligence
            </p>
          </div>
        </SidebarHeader>
        
        <SidebarContent className="space-y-2 px-1">
          {/* Progress tracker (now first) */}
          <ProgressTracker />
          
          <Separator className="my-1" />
          
          {/* Daily challenges (now second) */}
          <DailyChallenge />
          
          <Separator className="my-1" />
          
          {/* Conversation starters (now last) */}
          <ConversationStarters />
        </SidebarContent>
        
        <SidebarFooter>
          <div className="mt-auto p-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs rounded-lg hover:bg-humanly-pastel-lavender/30 text-humanly-indigo/80 transition-all duration-300" 
              onClick={() => window.open("https://humanlyai.me/support", "_blank")}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Report an Issue
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
