
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
    <div className="enhanced-header p-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <ChatLeftSidebarTrigger />
        <h1 className="font-medium text-lg bg-gradient-to-r from-humanly-indigo to-humanly-teal bg-clip-text text-transparent">
          Kai | EQ Coach
        </h1>
      </div>
      
      <div className="flex items-center">
        {/* Add Start New Chat button */}
        <StartNewChatButton />
        
        {/* Right sidebar trigger button with ensured visibility */}
        <div 
          className="right-sidebar-trigger-wrapper" 
          style={{
            position: 'relative',
            zIndex: 100,
            display: 'flex !important',
            visibility: 'visible',
            opacity: 1
          }}
        >
          <ChatRightSidebarTrigger />
        </div>
      </div>
    </div>
  );
}
