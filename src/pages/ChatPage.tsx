import { useEffect, lazy, Suspense, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { ChatProvider } from "@/context/ChatContext";
import { ChatInput } from "@/components/chat/ChatInput";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ARCHETYPES } from "@/lib/constants";
import { ExternalLink, ClipboardCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EQArchetype } from "@/types";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { markIntroductionAsShown } from "@/lib/introductionMessages";
import { ChatRightSidebar, ChatRightSidebarTrigger } from "@/components/chat/sidebar/ChatRightSidebar";

// Lazy load components that aren't immediately visible
const ChatList = lazy(() => import("@/components/chat/ChatList").then(module => ({ default: module.ChatList })));
const ChatUsage = lazy(() => import("@/components/chat/ChatUsage").then(module => ({ default: module.ChatUsage })));
const EnhancedChatSidebar = lazy(() => import("@/components/chat/sidebar/EnhancedChatSidebar").then(module => ({ default: module.EnhancedChatSidebar })));

// Simplified header component without the user menu
const ChatHeader = ({ hasCompletedAssessment, userArchetype }: { 
  hasCompletedAssessment: boolean, 
  userArchetype: string | undefined 
}) => {
  return (
    <div className="enhanced-header p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="font-medium text-lg bg-gradient-to-r from-humanly-indigo to-humanly-teal bg-clip-text text-transparent">
          Kai | EQ Coach
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {hasCompletedAssessment ? `Personalized for ${userArchetype}` : "General EQ coaching available"}
        </p>
      </div>
      
      {/* Right sidebar trigger button */}
      <ChatRightSidebarTrigger />
    </div>
  );
};

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
    <SidebarProvider defaultOpen={true}>
      <PageLayout fullWidth>
        <ChatProvider>
          <div className="flex h-screen overflow-hidden">
            {/* Left Sidebar */}
            <Suspense fallback={<div className="w-64 zen-sidebar animate-pulse"></div>}>
              <EnhancedChatSidebar />
            </Suspense>
            
            {/* Chat Area */}
            <div className="flex-1 flex flex-col overflow-hidden main-content">
              <ChatHeader 
                hasCompletedAssessment={hasCompletedAssessment}
                userArchetype={userArchetype}
              />
              
              <div className="flex-1 overflow-hidden flex flex-col">
                {!hasCompletedAssessment && <Alert className="m-4 bg-humanly-pastel-lavender/20 border-humanly-indigo/30 rounded-xl shadow-soft">
                    <ClipboardCheck className="h-4 w-4 text-humanly-indigo" />
                    <AlertDescription className="text-sm">
                      For more personalized coaching, consider{" "}
                      <Button variant="link" size="sm" className="p-0 h-auto text-humanly-indigo hover:text-humanly-indigo-dark underline decoration-humanly-indigo/30" onClick={handleStartAssessment}>
                        completing your EQ assessment
                      </Button>
                    </AlertDescription>
                  </Alert>}
                  
                <Suspense fallback={<div className="h-6 bg-humanly-pastel-lavender/10 animate-pulse m-4 rounded-md"></div>}>
                  <ChatUsage />
                </Suspense>
                
                <Suspense fallback={
                  <div className="flex-1 flex justify-center items-center">
                    <div className="animate-breathe rounded-full h-14 w-14 border-2 border-humanly-indigo/30 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-humanly-indigo"></div>
                    </div>
                  </div>
                }>
                  <ChatList />
                </Suspense>
                
                <ChatInput />
              </div>
            </div>
            
            {/* Right Sidebar (User Profile & Settings) */}
            <SidebarProvider defaultOpen={false}>
              <Suspense fallback={<div className="hidden"></div>}>
                <ChatRightSidebar />
              </Suspense>
            </SidebarProvider>
          </div>
        </ChatProvider>
      </PageLayout>
    </SidebarProvider>
  );
};

export default ChatPage;
