
import { ChatLeftSidebarTrigger } from "@/components/chat/sidebar/ChatLeftSidebarTrigger";
import { ChatRightSidebarTrigger } from "@/components/chat/sidebar/ChatRightSidebarTrigger";
import { StartNewChatButton } from "./StartNewChatButton";

interface ChatHeaderProps {
  hasCompletedAssessment: boolean;
  userArchetype: string | undefined;
  onStartAssessment: () => void;
}

export function ChatHeader({ hasCompletedAssessment, userArchetype, onStartAssessment }: ChatHeaderProps) {
  return (
    <div className="enhanced-header p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <ChatLeftSidebarTrigger />
        <h1 className="font-medium text-lg bg-gradient-to-r from-humanly-indigo to-humanly-teal bg-clip-text text-transparent">
          Kai | EQ Coach
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {hasCompletedAssessment ? `Personalized for ${userArchetype}` : "General EQ coaching available"}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Add Start New Chat button */}
        <StartNewChatButton />
        {/* Right sidebar trigger button */}
        <ChatRightSidebarTrigger />
      </div>
    </div>
  );
}
