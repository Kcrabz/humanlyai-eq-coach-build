import { useEffect, lazy, Suspense, useRef } from "react";
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
import { wasLoginSuccessful, clearLoginSuccess } from "@/utils/loginRedirectUtils";
import { Toaster } from "sonner";

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

  // Check if this is a post-login navigation - redirect to dashboard if so
  // But skip redirection if coming from dashboard (source=dashboard param)
  useEffect(() => {
    const source = searchParams.get('source');
    const isFromDashboard = source === 'dashboard';
    
    if (!isLoading && isAuthenticated && wasLoginSuccessful() && !isFromDashboard) {
      console.log("Post-login detected on chat page, redirecting to dashboard");
      navigate("/dashboard", { replace: true });
      return;
    }
    
    // If we're coming from dashboard, clear any login success flags
    if (isFromDashboard) {
      console.log("Coming from dashboard, clearing any login success flags");
      clearLoginSuccess();
    }
  }, [isAuthenticated, navigate, isLoading, searchParams]);

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

  return (
    <PageLayout fullWidth>
      {/* Add the default SidebarProvider at the top level */}
      <SidebarProvider>
        <LeftSidebarProvider>
          <RightSidebarProvider defaultOpen={true}>
            <ChatProvider>
              {/* Keep the Toaster for chat page only */}
              <Toaster position="bottom-right" richColors />
              
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
