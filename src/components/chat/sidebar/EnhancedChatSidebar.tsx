
import { useAuth } from "@/context/AuthContext";
import { ExternalLink, Menu, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  SidebarRail
} from "@/components/ui/sidebar";

// Import our sidebar components
import { ConversationStarters } from "./ConversationStarters";
import { ProgressTracker } from "./ProgressTracker";
import { DailyChallenge } from "./DailyChallenge";

export function EnhancedChatSidebar() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  return (
    <>
      {/* Mobile trigger button - only visible on small screens */}
      <div className="md:hidden absolute left-4 top-4 z-10">
        <SidebarTrigger />
      </div>
      
      {/* The sidebar itself */}
      <Sidebar 
        side="left" 
        variant="sidebar" 
        collapsible="offcanvas"
        className="border-r border-gray-100"
      >
        <SidebarRail className="hover:bg-gray-50" />
        
        <SidebarHeader>
          <div className="mb-2">
            <h2 className="font-semibold bg-gradient-to-r from-humanly-teal to-humanly-green bg-clip-text text-transparent flex items-center gap-2">
              <PanelLeft className="h-4 w-4 text-humanly-teal" />
              Your EQ Coach
            </h2>
            <p className="text-xs text-muted-foreground">
              Daily practice for emotional intelligence
            </p>
          </div>
        </SidebarHeader>
        
        <SidebarContent className="space-y-6">
          {/* Progress tracker */}
          <ProgressTracker />
          
          {/* Daily challenges */}
          <DailyChallenge />
          
          {/* Conversation starters */}
          <ConversationStarters />
        </SidebarContent>
        
        <SidebarFooter>
          <div className="mt-auto">
            <Button variant="outline" size="sm" className="w-full text-xs rounded-lg bg-white hover:bg-humanly-pastel-lavender/30 border-gray-200 transition-all duration-300" onClick={() => window.open("https://humanlyai.me/support", "_blank")}>
              <ExternalLink className="h-3 w-3 mr-1" />
              Report an Issue
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
