
import React, { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { CollapsibleMenu } from "@/components/layout/CollapsibleMenu";
import { useIsMobile } from "@/hooks/use-mobile";
import { InstallPWA } from "@/components/pwa/InstallPWA";
import { OfflineIndicator } from "@/components/pwa/OfflineIndicator";

interface PageLayoutProps {
  children: ReactNode;
  fullWidth?: boolean;
  delayHeaderAnimation?: boolean;
}

export function PageLayout({ children, fullWidth = false }: PageLayoutProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isPWA, setIsPWA] = useState(false);
  
  // Detect if running as PWA
  useEffect(() => {
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as any).standalone === true;
      setIsPWA(isStandalone);
    };
    
    // Initial check
    checkPWA();
    
    // Listen for changes
    const mediaQueryList = window.matchMedia('(display-mode: standalone)');
    const handleChange = () => checkPWA();
    mediaQueryList.addEventListener('change', handleChange);
    
    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, []);
  
  // On chat page, the sidebar handle the menu separately
  const isOnChatPage = location.pathname === "/chat";
  
  // Don't show menu on onboarding pages
  // On chat page, don't show menu as it's handled by the chat sidebar
  const shouldShowMenu = !location.pathname.includes("/onboarding") && !isOnChatPage;

  return (
    <div className={`min-h-${isMobile ? '100dvh' : '100vh'} flex flex-col relative overflow-hidden`}>
      {/* Background blobs */}
      <>
        <div className="fixed top-20 -left-32 w-64 h-64 bg-humanly-pastel-peach blob-animation -z-10 opacity-30 blob"></div>
        <div className="fixed bottom-20 -right-20 w-80 h-80 bg-humanly-pastel-blue blob-animation-delayed -z-10 opacity-30 blob"></div>
        <div className="fixed top-40 right-20 w-48 h-48 bg-humanly-pastel-mint blob-animation -z-10 opacity-20 blob" style={{ animationDelay: '3s' }}></div>
      </>
      
      {/* Sonner toast provider - positioned at bottom only */}
      <Toaster position="bottom-right" richColors />
      
      {/* PWA Install button - positioned top right */}
      <div className="fixed top-4 right-16 z-50">
        <InstallPWA />
      </div>
      
      {/* Offline indicator */}
      <OfflineIndicator />
      
      {/* Collapsible menu in the top right corner, shown based on conditions */}
      {shouldShowMenu && (
        <CollapsibleMenu />
      )}
      
      <main className={`flex-1 ${fullWidth ? "" : "container py-8"}`} style={{
        paddingBottom: isPWA ? `env(safe-area-inset-bottom, 0px)` : undefined
      }}>
        {children}
      </main>
    </div>
  );
}
