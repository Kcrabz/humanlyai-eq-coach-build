
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
import { ChatHistorySidebar } from "./ChatHistorySidebar";
import { Separator } from "@/components/ui/separator";

export function EnhancedChatSidebar() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  return (
    <>
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
              EQ Coach
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Daily practice for emotional intelligence
            </p>
          </div>
        </SidebarHeader>
        
        <SidebarContent className="space-y-8 px-1">
          {/* Progress tracker (now first) */}
          <ProgressTracker />
          
          <Separator />
          
          {/* Chat history section (now second) */}
          <div>
            <ChatHistorySidebar />
          </div>
          
          <Separator />
          
          {/* Daily challenges (now third) */}
          <DailyChallenge />
          
          {/* Conversation starters (now last) */}
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
