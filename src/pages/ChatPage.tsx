import { useEffect, lazy, Suspense, useRef } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
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
import { AuthNavigationService, NavigationState, isRetakingAssessment } from "@/services/authNavigationService";

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
  const location = useLocation();
  
  // Keep track of previous coaching mode to detect changes
  const prevCoachingModeRef = useRef<string | undefined>(undefined);
  
  // Only do minimal checks - main navigation is handled by AuthenticationGuard
  useEffect(() => {
    console.log("ChatPage: Running minimal auth check");

    // No direct redirections - let AuthenticationGuard handle that
    // Just log the navigation state for debugging
    const navState = AuthNavigationService.getState();
    const intentionalNavigation = AuthNavigationService.wasIntentionalNavigationToChat();
    
    console.log("ChatPage: Navigation state check:", { 
      state: navState?.state,
      intentional: intentionalNavigation,
      authenticated: isAuthenticated,
      onboarded: user?.onboarded
    });
    
    // If this is an intentional navigation from dashboard, mark it in state
    if (!navState && isAuthenticated && user?.onboarded) {
      console.log("ChatPage: Setting navigation state to NAVIGATING_TO_CHAT");
      AuthNavigationService.setState(NavigationState.NAVIGATING_TO_CHAT, { 
        userId: user.id,
        directUrlAccess: true
      });
    }
  }, [isAuthenticated, user, navigate]);

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

  // Simple loading state while auth is resolving
  if (isLoading || !isAuthenticated) {
    return <PageLayout fullWidth>
        <div className="flex justify-center items-center h-96">
          <div className="animate-breathe rounded-full h-14 w-14 border-2 border-humanly-indigo/30 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-humanly-indigo"></div>
          </div>
        </div>
      </PageLayout>;
  }

  // Handle case where user accesses chat but needs onboarding
  // AuthenticationGuard will handle the redirect
  if (!user?.onboarded) {
    return <PageLayout fullWidth>
        <div className="flex justify-center items-center h-96">
          <div className="animate-pulse">Checking onboarding status...</div>
        </div>
      </PageLayout>;
  }

  // Fix the type issues by ensuring proper type checking
  const userArchetype = user.eq_archetype as EQArchetype | undefined;
  const archetype = userArchetype && userArchetype !== undefined ? ARCHETYPES[userArchetype] : null;
  const hasCompletedAssessment = !!userArchetype && userArchetype !== undefined;

  return (
    <PageLayout fullWidth>
      {/* Add the default SidebarProvider at the top level */}
      <SidebarProvider>
        <LeftSidebarProvider>
          <RightSidebarProvider defaultOpen={true}>
            <ChatProvider>
              {/* PWA update notification */}
              <UpdateNotification reloadPage={handleReload} />
              
              <div className="flex h-screen overflow-hidden w-full">
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
