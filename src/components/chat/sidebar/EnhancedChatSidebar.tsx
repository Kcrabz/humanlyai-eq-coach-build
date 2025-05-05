
import { useAuth } from "@/context/AuthContext";
import { ExternalLink, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger
} from "@/components/ui/sidebar";

// Import our new sidebar components
import { ConversationStarters } from "./ConversationStarters";
import { ProgressTracker } from "./ProgressTracker";
import { DailyChallenge } from "./DailyChallenge";
import { StreakTracker } from "./StreakTracker";
import { SuggestedActivities } from "./SuggestedActivities";
import { useNavigate } from "react-router-dom";

export function EnhancedChatSidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (!user) return null;
  
  return (
    <>
      <div className="md:hidden absolute left-4 top-4 z-10">
        <SidebarTrigger />
      </div>
      
      <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
        <SidebarHeader>
          <div className="mb-2">
            <h2 className="font-semibold bg-gradient-to-r from-humanly-teal to-humanly-green bg-clip-text text-transparent">Your EQ Coach</h2>
            <p className="text-xs text-muted-foreground">
              Daily practice for emotional intelligence
            </p>
          </div>
        </SidebarHeader>
        
        <SidebarContent className="space-y-6">
          {/* Progress and streak tracking */}
          <ProgressTracker />
          
          {/* Daily challenges */}
          <DailyChallenge />
          
          {/* Conversation starters */}
          <ConversationStarters />
          
          {/* Activity calendar/streak */}
          <StreakTracker />
          
          {/* Suggested activities/next steps */}
          <SuggestedActivities />
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
