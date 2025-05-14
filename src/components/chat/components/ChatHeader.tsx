
import { ChatLeftSidebarTrigger } from "@/components/chat/sidebar/ChatLeftSidebarTrigger";
import { ChatRightSidebarTrigger } from "@/components/chat/sidebar/ChatRightSidebarTrigger";
import { StartNewChatButton } from "./StartNewChatButton";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatHeaderProps {
  hasCompletedAssessment: boolean;
  userArchetype: string | undefined;
  onStartAssessment: () => void;
}

export function ChatHeader({ hasCompletedAssessment, userArchetype, onStartAssessment }: ChatHeaderProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className={`enhanced-header flex items-center justify-between ${isMobile ? 'py-2 px-3' : 'p-3'}`}>
      <div className="flex items-center gap-3">
        <ChatLeftSidebarTrigger />
        <h1 className={`font-medium bg-gradient-to-r from-humanly-indigo to-humanly-teal bg-clip-text text-transparent ${isMobile ? 'text-base' : 'text-lg'}`}>
          Kai | EQ Coach
        </h1>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        {/* Add Start New Chat button */}
        <StartNewChatButton />
        
        {/* Right sidebar trigger button at the edge */}
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
