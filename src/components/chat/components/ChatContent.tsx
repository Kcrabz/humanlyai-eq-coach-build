
import { lazy, Suspense } from "react";
import { ChatInput } from "@/components/chat/ChatInput";
import { EQAssessmentAlert } from "./EQAssessmentAlert";
import { useIsMobile } from "@/hooks/use-mobile";

// Lazy load components that aren't immediately visible
const ChatList = lazy(() => import("@/components/chat/ChatList").then(module => ({ default: module.ChatList })));
// Import ChatUsage directly instead of lazy loading it to ensure it's used within the ChatProvider
import { ChatUsage } from "@/components/chat/ChatUsage";

interface ChatContentProps {
  hasCompletedAssessment: boolean;
  onStartAssessment: () => void;
}

export function ChatContent({ hasCompletedAssessment, onStartAssessment }: ChatContentProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex-1 overflow-hidden flex flex-col ${isMobile ? 'max-h-[calc(100dvh-60px)]' : ''}`}>
      {!hasCompletedAssessment && <EQAssessmentAlert onStartAssessment={onStartAssessment} />}
      
      {/* Use ChatUsage directly, not in Suspense */}
      <ChatUsage />
      
      <Suspense fallback={
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-breathe rounded-full h-14 w-14 border-2 border-humanly-indigo/30 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-humanly-indigo"></div>
          </div>
        </div>
      }>
        <ChatList />
      </Suspense>
      
      <ChatInput />
    </div>
  );
}
