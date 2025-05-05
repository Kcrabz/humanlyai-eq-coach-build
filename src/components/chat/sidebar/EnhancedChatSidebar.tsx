
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
        <SidebarTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 flex items-center justify-center rounded-full bg-humanly-pastel-lavender/30 text-humanly-indigo"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SidebarTrigger>
      </div>
      
      {/* The sidebar itself */}
      <Sidebar 
        side="left" 
        variant="sidebar" 
        collapsible="offcanvas"
        className="zen-sidebar"
      >
        <SidebarRail className="hover:bg-humanly-pastel-lavender/20" />
        
        <SidebarHeader>
          <div className="mb-4 p-1">
            <h2 className="font-medium text-base bg-gradient-to-r from-humanly-indigo to-humanly-teal bg-clip-text text-transparent flex items-center gap-2">
              <PanelLeft className="h-4 w-4 text-humanly-indigo" />
              Your EQ Coach
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Daily practice for emotional intelligence
            </p>
          </div>
        </SidebarHeader>
        
        <SidebarContent className="space-y-8 px-1">
          {/* Progress tracker */}
          <ProgressTracker />
          
          {/* Daily challenges */}
          <DailyChallenge />
          
          {/* Conversation starters */}
          <ConversationStarters />
        </SidebarContent>
        
        <SidebarFooter>
          <div className="mt-auto p-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs rounded-lg bg-white hover:bg-humanly-pastel-lavender/30 border-gray-200 text-humanly-indigo/80 transition-all duration-300" 
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
