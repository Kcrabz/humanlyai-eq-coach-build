
import { useEffect, lazy, Suspense } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { ChatProvider } from "@/context/ChatContext";
import { ChatInput } from "@/components/chat/ChatInput";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ARCHETYPES } from "@/lib/constants";
import { ExternalLink, ClipboardCheck, Menu } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EQArchetype } from "@/types";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";

// Lazy load components that aren't immediately visible
const ChatList = lazy(() => import("@/components/chat/ChatList").then(module => ({ default: module.ChatList })));
const ChatUsage = lazy(() => import("@/components/chat/ChatUsage").then(module => ({ default: module.ChatUsage })));
const EnhancedChatSidebar = lazy(() => import("@/components/chat/sidebar/EnhancedChatSidebar").then(module => ({ default: module.EnhancedChatSidebar })));

// Create a HeaderWithSidebar component to use the useSidebar hook
const HeaderWithSidebar = ({ user, hasCompletedAssessment, userArchetype }: { 
  user: any, 
  hasCompletedAssessment: boolean, 
  userArchetype: string | undefined 
}) => {
  const { toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  
  return (
    <div className="border-b p-4 flex items-center justify-between bg-white/50 backdrop-blur-sm shadow-sm">
      <div className="flex items-center gap-2">
        {/* Desktop sidebar trigger */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 hidden md:flex" 
          aria-label="Toggle Sidebar"
          onClick={toggleSidebar}
        >
          <Menu className="h-4 w-4" />
        </Button>
        
        <div>
          <h1 className="font-bold bg-gradient-to-r from-humanly-teal to-humanly-teal-light bg-clip-text text-transparent">Kai | EQ Coach</h1>
          <p className="text-xs text-muted-foreground">
            {hasCompletedAssessment ? `Personalized for ${userArchetype}` : "General EQ coaching available"}
          </p>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={() => navigate("/subscription")} className="rounded-lg border-humanly-teal/20 hover:bg-humanly-teal/5 transition-all duration-300">
        {user.subscription_tier === "free" ? "Upgrade" : "Manage Plan"}
      </Button>
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

  // Optimize auth check to use fewer rerenders
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    } else if (!isLoading && isAuthenticated && user && !user.onboarded) {
      navigate("/onboarding");
    }
  }, [isAuthenticated, navigate, user?.onboarded, isLoading]);

  const handleStartAssessment = () => {
    navigate("/onboarding?step=archetype", { 
      replace: false,
      state: { retakingAssessment: true }
    });
  };

  if (isLoading || !isAuthenticated || !user?.onboarded) {
    return <PageLayout fullWidth>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-humanly-teal"></div>
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
            {/* Lazy load sidebar with suspense fallback */}
            <Suspense fallback={<div className="w-64 bg-gray-50"></div>}>
              <EnhancedChatSidebar />
            </Suspense>
            
            {/* Chat Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <HeaderWithSidebar 
                user={user} 
                hasCompletedAssessment={hasCompletedAssessment}
                userArchetype={userArchetype}
              />
              
              <div className="flex-1 overflow-hidden flex flex-col">
                {!hasCompletedAssessment && <Alert className="m-4 bg-humanly-pastel-peach/20 border-humanly-teal/30">
                    <ClipboardCheck className="h-4 w-4 text-humanly-teal" />
                    <AlertDescription className="text-sm">
                      For more personalized coaching, consider{" "}
                      <Button variant="link" size="sm" className="p-0 h-auto text-humanly-teal underline" onClick={handleStartAssessment}>
                        completing your EQ assessment
                      </Button>
                    </AlertDescription>
                  </Alert>}
                  
                <Suspense fallback={<div className="h-6 bg-gray-50 m-4"></div>}>
                  <ChatUsage />
                </Suspense>
                
                <Suspense fallback={
                  <div className="flex-1 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-humanly-teal"></div>
                  </div>
                }>
                  <ChatList />
                </Suspense>
                
                <ChatInput />
              </div>
            </div>
          </div>
        </ChatProvider>
      </PageLayout>
    </SidebarProvider>
  );
};

export default ChatPage;
