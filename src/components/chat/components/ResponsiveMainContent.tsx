
import { useSidebar } from "@/components/ui/sidebar";
import { ChatHeader } from "./ChatHeader";
import { ChatContent } from "./ChatContent";

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
      
      <ChatContent 
        hasCompletedAssessment={hasCompletedAssessment}
        onStartAssessment={onStartAssessment}
      />
    </div>
  );
}
