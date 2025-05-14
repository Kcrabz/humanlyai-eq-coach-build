
import React, { ReactNode } from "react";
import { useLocation } from "react-router-dom";
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
  
  // On chat page, the sidebar handle the menu separately
  const isOnChatPage = location.pathname === "/chat";
  
  // Don't show menu on onboarding pages
  // On chat page, don't show menu as it's handled by the chat sidebar
  const shouldShowMenu = !location.pathname.includes("/onboarding") && !isOnChatPage;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background blobs */}
      <>
        <div className="fixed top-20 -left-32 w-64 h-64 bg-humanly-pastel-peach blob-animation -z-10 opacity-30 blob"></div>
        <div className="fixed bottom-20 -right-20 w-80 h-80 bg-humanly-pastel-blue blob-animation-delayed -z-10 opacity-30 blob"></div>
        <div className="fixed top-40 right-20 w-48 h-48 bg-humanly-pastel-mint blob-animation -z-10 opacity-20 blob" style={{ animationDelay: '3s' }}></div>
      </>
      
      {/* Removed Sonner toast provider */}
      
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
      
      <main className={`flex-1 ${fullWidth ? "" : "container py-8"}`}>
        {children}
      </main>
    </div>
  );
}
