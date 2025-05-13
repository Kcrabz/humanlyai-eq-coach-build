
import { useSidebar } from "@/components/ui/sidebar";
import { ChatHeader } from "./ChatHeader";
import { ChatContent } from "./ChatContent";
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
  
  // Detect if running as PWA
  useEffect(() => {
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as any).standalone === true;
      setIsPWA(isStandalone);
    };
    
    // Check on initial render
    checkPWA();
    
    // Also check when display mode changes
    const mediaQueryList = window.matchMedia('(display-mode: standalone)');
    const handleChange = () => checkPWA();
    
    // Use the correct event listener based on browser support
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handleChange);
    } else if ((mediaQueryList as any).addListener) {
      // Older browsers
      (mediaQueryList as any).addListener(handleChange);
    }
    
    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', handleChange);
      } else if ((mediaQueryList as any).removeListener) {
        (mediaQueryList as any).removeListener(handleChange);
      }
    };
  }, []);
  
  // On mobile, we don't want to adjust the width based on sidebars
  // as they should overlay instead of pushing content
  const contentWidth = isMobile 
    ? '100%' 
    : (rightSidebarOpen && !isPWA)
      ? 'calc(100% - 16rem)'  // Adjusted to match 64px/16rem from original
      : (rightSidebarOpen && isPWA)
        ? 'calc(100% - 16rem)'  // Adjusted to match 16rem from original
        : '100%';

  const contentStyle = {
    width: contentWidth,
    transition: 'width 0.3s ease',
    marginRight: '0'
  };

  return (
    <div 
      className="flex-1 flex flex-col overflow-hidden main-content relative"
      style={contentStyle}
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
