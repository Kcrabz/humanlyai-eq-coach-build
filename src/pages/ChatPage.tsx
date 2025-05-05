
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { ChatProvider } from "@/context/ChatContext";
import { ChatList } from "@/components/chat/ChatList";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatUsage } from "@/components/chat/ChatUsage";
import { EnhancedChatUI } from "@/components/chat/EnhancedChatUI";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ARCHETYPES } from "@/lib/constants";
import { ExternalLink, ClipboardCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EQArchetype } from "@/types";

// Import our new sidebar component
import { EnhancedChatSidebar } from "@/components/chat/sidebar/EnhancedChatSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

const ChatPage = () => {
  const {
    user,
    isAuthenticated,
    isLoading
  } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!isLoading) {
      console.log("Chat page auth check:", {
        isAuthenticated,
        user,
        isOnboarded: user?.onboarded
      });
      if (!isAuthenticated) {
        navigate("/login");
      } else if (typeof user?.onboarded !== "boolean" || user?.onboarded === false) {
        // Explicitly check if onboarded is false or not a boolean (still loading)
        console.log("User not onboarded or onboarded status unclear, redirecting to onboarding");
        navigate("/onboarding");
      }
    }
  }, [isAuthenticated, navigate, user, isLoading]);

  const handleStartAssessment = () => {
    console.log("Start assessment button clicked, navigating to /onboarding?step=archetype");
    // Use navigate with state to maintain the information that we're intentionally going to onboarding
    navigate("/onboarding?step=archetype", { 
      replace: false,
      state: { retakingAssessment: true }
    });
  };

  if (isLoading || !isAuthenticated || typeof user?.onboarded !== "boolean" || !user?.onboarded) {
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
            {/* Enhanced Sidebar - Added */}
            <EnhancedChatSidebar />
            
            {/* Chat Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="border-b p-4 flex items-center justify-between bg-white/50 backdrop-blur-sm shadow-sm">
                <div>
                  <h1 className="font-bold bg-gradient-to-r from-humanly-teal to-humanly-teal-light bg-clip-text text-transparent">Kai | EQ Coach</h1>
                  <p className="text-xs text-muted-foreground">
                    {hasCompletedAssessment ? `Personalized for ${userArchetype}` : "General EQ coaching available"}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate("/subscription")} className="rounded-lg border-humanly-teal/20 hover:bg-humanly-teal/5 transition-all duration-300">
                  {user.subscription_tier === "free" ? "Upgrade" : "Manage Plan"}
                </Button>
              </div>
              
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
                <ChatUsage />
                <ChatList />
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
