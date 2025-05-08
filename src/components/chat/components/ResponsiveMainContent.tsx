
import { lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ClipboardCheck } from "lucide-react";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";

// Lazy load components that aren't immediately visible
const ChatList = lazy(() => import("@/components/chat/ChatList").then(module => ({ default: module.ChatList })));
const ChatUsage = lazy(() => import("@/components/chat/ChatUsage").then(module => ({ default: module.ChatUsage })));

interface ResponsiveMainContentProps {
  hasCompletedAssessment: boolean;
  userArchetype: string | undefined;
  onStartAssessment: () => void;
}

export function ResponsiveMainContent({ 
  hasCompletedAssessment, 
  userArchetype,
  onStartAssessment
}: ResponsiveMainContentProps) {
  // Get sidebar states to adjust main content
  const { open: rightSidebarOpen } = useSidebar("right");
  const { open: leftSidebarOpen } = useSidebar("left");

  return (
    <div 
      className={`flex-1 flex flex-col overflow-hidden main-content ${
        rightSidebarOpen ? 'main-content-with-right-sidebar-open' : 'main-content-with-right-sidebar-closed'
      }`}
    >
      <ChatHeader 
        hasCompletedAssessment={hasCompletedAssessment}
        userArchetype={userArchetype}
        onStartAssessment={onStartAssessment}
      />
      
      <div className="flex-1 overflow-hidden flex flex-col">
        {!hasCompletedAssessment && <Alert className="m-4 bg-humanly-pastel-lavender/20 border-humanly-indigo/30 rounded-xl shadow-soft">
            <ClipboardCheck className="h-4 w-4 text-humanly-indigo" />
            <AlertDescription className="text-sm">
              For more personalized coaching, consider{" "}
              <Button variant="link" size="sm" className="p-0 h-auto text-humanly-indigo hover:text-humanly-indigo-dark underline decoration-humanly-indigo/30" onClick={onStartAssessment}>
                completing your EQ assessment
              </Button>
            </AlertDescription>
          </Alert>}
          
        <Suspense fallback={<div className="h-6 bg-humanly-pastel-lavender/10 animate-pulse m-4 rounded-md"></div>}>
          <ChatUsage />
        </Suspense>
        
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
    </div>
  );
}
