
import { useSidebar } from "@/components/ui/sidebar";
import { ChatHeader } from "./ChatHeader";
import { ChatContent } from "../ChatContent";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";

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
  const isMobile = useIsMobile();
  const [isPWA, setIsPWA] = useState(false);
  
  // Detect if running as PWA - simplified for reliability
  useEffect(() => {
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as any).standalone === true;
      setIsPWA(isStandalone);
    };
    
    // Check on initial render
    checkPWA();
    
    // Also listen for changes
    const mediaQueryList = window.matchMedia('(display-mode: standalone)');
    const handleChange = () => checkPWA();
    mediaQueryList.addEventListener('change', handleChange);
    
    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, []);
  
  // On mobile, we don't want to adjust the width based on sidebars
  // as they should overlay instead of pushing content
  const contentWidth = isMobile 
    ? '100%' 
    : rightSidebarOpen
      ? 'calc(100% - 16rem)'
      : '100%';

  return (
    <div 
      className="flex flex-col overflow-hidden main-content"
      style={{ 
        width: contentWidth,
        transition: 'width 0.3s ease'
      }}
      data-pwa={isPWA ? "true" : "false"}
      data-right-sidebar-open={rightSidebarOpen ? "true" : "false"}
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
