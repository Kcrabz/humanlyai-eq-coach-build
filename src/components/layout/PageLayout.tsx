
import React, { ReactNode, useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { useLocation } from "react-router-dom";
import { Toaster } from "sonner";

interface PageLayoutProps {
  children: ReactNode;
  fullWidth?: boolean;
  delayHeaderAnimation?: boolean;
}

export function PageLayout({ children, fullWidth = false, delayHeaderAnimation = false }: PageLayoutProps) {
  const location = useLocation();
  const [showHeader, setShowHeader] = useState(false);
  
  // Don't show header only on onboarding pages and chat page
  const shouldShowHeader = !location.pathname.includes("/onboarding") && location.pathname !== "/chat";

  useEffect(() => {
    console.log("PageLayout effect triggered", { 
      delayHeaderAnimation, 
      shouldShowHeader 
    });
    
    if (!delayHeaderAnimation || !shouldShowHeader) {
      console.log("Setting showHeader immediately:", shouldShowHeader);
      setShowHeader(shouldShowHeader);
      return;
    }
    
    // If we're delaying header animation, start with it hidden
    console.log("Delaying header animation, starting with hidden header");
    setShowHeader(false);
  }, [delayHeaderAnimation, shouldShowHeader]);

  // Function to show header - will be called by HeroSection
  const displayHeader = () => {
    console.log("displayHeader function called, setting showHeader to true");
    setShowHeader(true);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background blobs */}
      <>
        <div className="fixed top-20 -left-32 w-64 h-64 bg-humanly-pastel-peach blob-animation -z-10 opacity-30 blob"></div>
        <div className="fixed bottom-20 -right-20 w-80 h-80 bg-humanly-pastel-blue blob-animation-delayed -z-10 opacity-30 blob"></div>
        <div className="fixed top-40 right-20 w-48 h-48 bg-humanly-pastel-mint blob-animation -z-10 opacity-20 blob" style={{ animationDelay: '3s' }}></div>
      </>
      
      {/* Sonner toast provider */}
      <Toaster position="top-right" richColors />
      
      {shouldShowHeader && (
        <div className={`transition-opacity duration-700 ease-in-out ${showHeader ? 'opacity-100' : 'opacity-0'}`}>
          <Header />
        </div>
      )}
      
      <main className={`flex-1 ${fullWidth ? "" : "container py-8"}`}>
        {React.isValidElement(children) ? React.cloneElement(children as React.ReactElement, { displayHeader }) : children}
      </main>
    </div>
  );
}
