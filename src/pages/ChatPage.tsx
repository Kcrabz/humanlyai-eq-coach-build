
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

const ChatPage = () => {
  const {
    user,
    isAuthenticated,
    isLoading
  } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      console.log("Chat page auth check:", {
        isAuthenticated,
        user,
        isOnboarded: user?.onboarded
      });
      if (!isAuthenticated) {
        navigate("/login");
      } else if (user && user.onboarded === false) {
        console.log("User not onboarded, redirecting to onboarding");
        navigate("/onboarding");
      }
    }
  }, [isAuthenticated, navigate, user, isLoading]);

  const handleStartAssessment = () => {
    navigate("/onboarding");
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

  return <PageLayout fullWidth>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:block w-64 bg-gradient-to-b from-white to-humanly-gray-lightest border-r p-4 shadow-sm">
          <div className="mb-6">
            <h2 className="font-semibold bg-gradient-to-r from-humanly-teal to-humanly-green bg-clip-text text-transparent">Your EQ Coach</h2>
            <p className="text-xs text-muted-foreground">
              Start a conversation anytime
            </p>
          </div>

          {hasCompletedAssessment && archetype ? <div className="mb-6">
              <h3 className="text-xs uppercase font-semibold text-muted-foreground mb-2">Your Archetype</h3>
              <div className="enhanced-card p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{archetype.icon}</span>
                  <span className="font-medium">{archetype.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {archetype.description.substring(0, 100)}...
                </p>
              </div>
            </div> : <div className="mb-6">
              <h3 className="text-xs uppercase font-semibold text-muted-foreground mb-2">Your Archetype</h3>
              <div className="enhanced-card p-3 border border-dashed border-humanly-teal/30">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">⭐</span>
                  <span className="font-medium">Complete Assessment</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Take the EQ assessment to get personalized coaching
                </p>
                <Button size="sm" variant="outline" className="w-full mt-2 border-humanly-teal/20 text-humanly-teal hover:bg-humanly-teal/5" onClick={handleStartAssessment}>
                  Start Assessment
                </Button>
              </div>
            </div>}

          <div className="mb-6">
            <h3 className="text-xs uppercase font-semibold text-muted-foreground mb-2">Subscription</h3>
            <div className="enhanced-card p-3">
              <p className="font-medium">{user.subscription_tier === 'premium' ? 'Premium' : user.subscription_tier === 'basic' ? 'Basic' : 'Free Trial'}</p>
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-muted-foreground">
                  {user.subscription_tier === 'free' ? 'Expires in 24h' : 'Monthly plan'}
                </p>
                <Button size="sm" variant="outline" onClick={() => navigate("/pricing")} className="rounded-lg border-humanly-teal/20 hover:bg-humanly-teal/5 transition-all duration-300">
                  {user.subscription_tier === 'premium' ? 'Manage' : 'Upgrade'}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-auto">
            <Button variant="outline" size="sm" className="w-full text-xs rounded-lg bg-white hover:bg-humanly-pastel-lavender/30 border-gray-200 transition-all duration-300" onClick={() => window.open("https://humanlyai.me/support", "_blank")}>
              <ExternalLink className="h-3 w-3 mr-1" />
              Report an Issue
            </Button>
          </div>
        </div>

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
          
          <ChatProvider>
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
          </ChatProvider>
        </div>
      </div>
    </PageLayout>;
};

export default ChatPage;
