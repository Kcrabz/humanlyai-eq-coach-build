
import { lazy, Suspense } from "react";
import { ChatInput } from "@/components/chat/ChatInput";
import { EQAssessmentAlert } from "./components/EQAssessmentAlert";

// Lazy load components that aren't immediately visible
const ChatList = lazy(() => import("@/components/chat/ChatList").then(module => ({ default: module.ChatList })));
// Import ChatUsage directly instead of lazy loading it to ensure it's used within the ChatProvider
import { ChatUsage } from "@/components/chat/ChatUsage";

interface ChatContentProps {
  hasCompletedAssessment: boolean;
  onStartAssessment: () => void;
}

export function ChatContent({ hasCompletedAssessment, onStartAssessment }: ChatContentProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {!hasCompletedAssessment && <EQAssessmentAlert onStartAssessment={onStartAssessment} />}
      
      {/* Use ChatUsage directly, not in Suspense */}
      <ChatUsage />
      
      <Suspense fallback={
        <div className="flex-1 flex justify-center items-center min-h-0">
          <div className="animate-breathe rounded-full h-14 w-14 border-2 border-humanly-indigo/30 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-humanly-indigo"></div>
          </div>
        </div>
      }>
        <ChatList />
      </Suspense>
      
      <div className="sticky bottom-0 bg-white z-10">
        <ChatInput />
      </div>
    </div>
  );
}
