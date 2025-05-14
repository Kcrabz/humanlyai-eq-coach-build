
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
import { getAuthState, AuthState, setAuthState } from "@/services/authService";

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
  
  // Get source parameter to detect navigation from dashboard
  const source = new URLSearchParams(location.search).get('source');
  const isFromDashboard = source === 'dashboard';
  
  // Keep track of previous coaching mode to detect changes
  const prevCoachingModeRef = useRef<string | undefined>(undefined);
  
  // Check if the user is onboarded - only once when component mounts
  useEffect(() => {
    // Wait until authentication is complete
    if (isLoading) return;
    
    if (!isAuthenticated) {
      // Not logged in - redirect to login
      console.log("User not authenticated, redirecting to login");
      navigate("/login", { state: { returnTo: '/chat' } });
      return;
    }
    
    if (user && !user.onboarded) {
      // Logged in but not onboarded - redirect to onboarding
      console.log("User not onboarded, redirecting to onboarding");
      navigate("/onboarding", { replace: true });
      return;
    }
    
    // If we get here, the user is authenticated and onboarded
    // Mark the chat page as the current destination to prevent further redirects
    setAuthState(AuthState.ONBOARDED, { currentPage: 'chat', timestamp: Date.now() });
    
    console.log("User authenticated and onboarded, staying on chat page");
  }, [isAuthenticated, user, isLoading, navigate]);

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
