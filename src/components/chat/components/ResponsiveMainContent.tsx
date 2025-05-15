
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
  const [isIOS, setIsIOS] = useState(false);
  
  // Detect if device is iOS
  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);
  }, []);
  
  // On mobile, we don't want to adjust the width based on sidebars
  // as they should overlay instead of pushing content
  const contentWidth = isMobile 
    ? '100%' 
    : rightSidebarOpen
      ? 'calc(100% - 16rem)'
      : '100%';

  // Only use dynamic viewport height for mobile and iOS
  const contentStyle = {
    width: contentWidth,
    transition: 'width 0.3s ease',
    marginRight: '0',
    height: isMobile || isIOS ? '100dvh' : '100vh'
  };

  return (
    <div 
      className="flex-1 flex flex-col overflow-hidden main-content"
      style={contentStyle}
      data-ios={isIOS ? "true" : "false"}
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
