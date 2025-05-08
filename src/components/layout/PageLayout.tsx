
import React, { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { CollapsibleMenu } from "@/components/layout/CollapsibleMenu";

interface PageLayoutProps {
  children: ReactNode;
  fullWidth?: boolean;
  delayHeaderAnimation?: boolean;
}

export function PageLayout({ children, fullWidth = false }: PageLayoutProps) {
  const location = useLocation();
  
  // Don't show menu on onboarding pages and chat page
  const shouldShowMenu = !location.pathname.includes("/onboarding") && location.pathname !== "/chat";

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background blobs */}
      <>
        <div className="fixed top-20 -left-32 w-64 h-64 bg-humanly-pastel-peach blob-animation -z-10 opacity-30 blob"></div>
        <div className="fixed bottom-20 -right-20 w-80 h-80 bg-humanly-pastel-blue blob-animation-delayed -z-10 opacity-30 blob"></div>
        <div className="fixed top-40 right-20 w-48 h-48 bg-humanly-pastel-mint blob-animation -z-10 opacity-20 blob" style={{ animationDelay: '3s' }}></div>
      </>
      
      {/* Sonner toast provider - positioned at bottom only */}
      <Toaster position="bottom-right" richColors />
      
      {/* Collapsible menu in the top right corner, only shown outside of onboarding/chat */}
      {shouldShowMenu && (
        <CollapsibleMenu />
      )}
      
      <main className={`flex-1 ${fullWidth ? "" : "container py-8"}`}>
        {children}
      </main>
    </div>
  );
}
