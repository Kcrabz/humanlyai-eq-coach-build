import { useEffect, lazy, Suspense, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { ChatProvider } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import { ARCHETYPES } from "@/lib/constants";
import { EQArchetype } from "@/types";
import { SidebarProvider, LeftSidebarProvider, RightSidebarProvider } from "@/components/ui/sidebar";
import { markIntroductionAsShown } from "@/lib/introductionMessages";
import { ChatRightSidebar } from "@/components/chat/sidebar/ChatRightSidebar";
import { ResponsiveMainContent } from "@/components/chat/components/ResponsiveMainContent";
import { UpdateNotification } from "@/components/pwa/UpdateNotification";

// Lazy load components that aren't immediately visible
const EnhancedChatSidebar = lazy(() => import("@/components/chat/sidebar/EnhancedChatSidebar").then(module => ({ default: module.EnhancedChatSidebar })));

const ChatPage = () => {
  const {
    user,
    isAuthenticated,
    isLoading
  } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Keep track of previous coaching mode to detect changes
  const prevCoachingModeRef = useRef<string | undefined>(undefined);
  const [isMobileSafari, setIsMobileSafari] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  // Detect Mobile Safari
  useEffect(() => {
    const ua = navigator.userAgent;
    const isSafari = /Safari/i.test(ua) && !/Chrome/i.test(ua);
    const isMobile = /iPhone|iPad|iPod/i.test(ua);
    setIsMobileSafari(isSafari && isMobile);
  }, []);

  // Handle user interaction to fix Safari height bug
  useEffect(() => {
    if (!isMobileSafari) return;
    
    const handleInteraction = () => {
      setUserInteracted(true);
    };

    // Listen for interactions that should trigger height fix
    document.addEventListener('touchstart', handleInteraction, { once: true });
    document.addEventListener('scroll', handleInteraction, { once: true });
    document.addEventListener('click', handleInteraction, { once: true });

    return () => {
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('scroll', handleInteraction);
      document.removeEventListener('click', handleInteraction);
    };
  }, [isMobileSafari]);

  // Optimize auth check to use fewer rerenders
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    } else if (!isLoading && isAuthenticated && user && !user.onboarded) {
      navigate("/onboarding");
    }
  }, [isAuthenticated, navigate, user?.onboarded, isLoading]);

  // Reset introduction when coaching mode changes
  useEffect(() => {
    if (user && user.id) {
      // If coaching mode has changed, reset the introduction flag
      if (prevCoachingModeRef.current !== undefined && 
          prevCoachingModeRef.current !== user.coaching_mode) {
        console.log('Coaching mode changed, resetting introduction');
        localStorage.removeItem(`humanly_intro_shown_${user.id}`);
      }
      
      // Update the ref for next comparison
      prevCoachingModeRef.current = user.coaching_mode;
    }
  }, [user?.coaching_mode, user?.id]);

  const handleStartAssessment = () => {
    navigate("/onboarding?step=archetype", { 
      replace: false,
      state: { retakingAssessment: true }
    });
  };
  
  // Handle reload for PWA updates
  const handleReload = () => {
    window.location.reload();
  };

  if (isLoading || !isAuthenticated || !user?.onboarded) {
    return <PageLayout fullWidth>
        <div className="flex justify-center items-center h-96">
          <div className="animate-breathe rounded-full h-14 w-14 border-2 border-humanly-indigo/30 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-humanly-indigo"></div>
          </div>
        </div>
      </PageLayout>;
  }

  // Fix the type issues by ensuring proper type checking
  const userArchetype = user.eq_archetype as EQArchetype | undefined;
  const archetype = userArchetype && userArchetype !== undefined ? ARCHETYPES[userArchetype] : null;
  const hasCompletedAssessment = !!userArchetype && userArchetype !== undefined;

  // Determine the height class based on browser and interaction state
  const heightClass = isMobileSafari && !userInteracted 
    ? "min-h-[85vh]" 
    : "h-[100dvh]";

  return (
    <PageLayout fullWidth>
      {/* Add the default SidebarProvider at the top level */}
      <SidebarProvider>
        <LeftSidebarProvider>
          <RightSidebarProvider defaultOpen={true}>
            <ChatProvider>
              {/* PWA update notification */}
              <UpdateNotification reloadPage={handleReload} />
              
              <div className={`flex ${heightClass} overflow-hidden w-full`}>
                {/* Left Sidebar */}
                <Suspense fallback={<div className="w-64 zen-sidebar animate-pulse"></div>}>
                  <EnhancedChatSidebar />
                </Suspense>
                
                {/* Chat Area */}
                <ResponsiveMainContent 
                  hasCompletedAssessment={hasCompletedAssessment}
                  userArchetype={userArchetype}
                  onStartAssessment={handleStartAssessment}
                />
                
                {/* Right Sidebar (User Profile & Settings) */}
                <ChatRightSidebar />
              </div>
            </ChatProvider>
          </RightSidebarProvider>
        </LeftSidebarProvider>
      </SidebarProvider>
    </PageLayout>
  );
};

export default ChatPage;
