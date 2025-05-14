
import { useSidebar } from "@/components/ui/sidebar";
import { ChatHeader } from "./ChatHeader";
import { ChatContent } from "./ChatContent";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState, useLayoutEffect } from "react";

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
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  
  // Handle viewport height changes (mobile browsers address bar appearing/disappearing)
  const updateViewportHeight = () => {
    setViewportHeight(window.innerHeight);
  };
  
  // Use layout effect for smoother transition when keyboard appears
  useLayoutEffect(() => {
    updateViewportHeight();
    window.addEventListener('resize', updateViewportHeight);
    
    // On some mobile browsers, we need to listen for orientation change as well
    window.addEventListener('orientationchange', updateViewportHeight);
    
    return () => {
      window.removeEventListener('resize', updateViewportHeight);
      window.removeEventListener('orientationchange', updateViewportHeight);
    };
  }, []);
  
  // Detect if running as PWA
  useEffect(() => {
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as any).standalone === true;
      setIsPWA(isStandalone);
      
      // Apply PWA class to html and body if in PWA mode
      if (isStandalone) {
        document.documentElement.classList.add('pwa');
        document.body.classList.add('pwa');
      } else {
        document.documentElement.classList.remove('pwa');
        document.body.classList.remove('pwa');
      }
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
      ? 'calc(100% - 16rem)'
      : (rightSidebarOpen && isPWA)
        ? 'calc(100% - 14.5rem)'
        : '100%';

  return (
    <div 
      className="flex-1 flex flex-col overflow-hidden main-content relative"
      style={{
        width: contentWidth,
        transition: 'width 0.3s ease',
        height: isMobile ? '100svh' : '100%', // Use small viewport height for mobile
        maxHeight: isMobile ? '100svh' : '100%'
      }}
      data-pwa={isPWA ? "true" : "false"}
      data-right-sidebar-open={rightSidebarOpen ? "true" : "false"}
      data-mobile={isMobile ? "true" : "false"}
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
