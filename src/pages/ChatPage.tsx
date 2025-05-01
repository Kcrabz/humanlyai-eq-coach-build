
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { ChatProvider } from "@/context/ChatContext";
import { ChatList } from "@/components/chat/ChatList";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatUsage } from "@/components/chat/ChatUsage";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ARCHETYPES } from "@/lib/constants";
import { ExternalLink } from "lucide-react";

const ChatPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate("/login");
      } else if (user && !user.onboarded) {
        navigate("/onboarding");
      }
    }
  }, [isAuthenticated, navigate, user, isLoading]);

  if (isLoading || !isAuthenticated || !user?.onboarded) {
    return (
      <PageLayout fullWidth>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-humanly-teal"></div>
        </div>
      </PageLayout>
    );
  }
  
  const archetype = user.eq_archetype ? ARCHETYPES[user.eq_archetype] : null;

  return (
    <PageLayout fullWidth>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:block w-64 bg-humanly-gray-lightest border-r p-4">
          <div className="mb-6">
            <h2 className="font-semibold">Your EQ Coach</h2>
            <p className="text-xs text-muted-foreground">
              Start a conversation anytime
            </p>
          </div>

          {user.eq_archetype && archetype && (
            <div className="mb-6">
              <h3 className="text-xs uppercase font-semibold text-muted-foreground mb-2">Your Archetype</h3>
              <div className="bg-white p-3 rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{archetype.icon}</span>
                  <span className="font-medium">{archetype.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {archetype.description.substring(0, 100)}...
                </p>
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-xs uppercase font-semibold text-muted-foreground mb-2">Subscription</h3>
            <div className="bg-white p-3 rounded-lg border">
              <p className="font-medium">{user.subscription_tier === 'premium' ? 'Premium' : (user.subscription_tier === 'basic' ? 'Basic' : 'Free Trial')}</p>
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-muted-foreground">
                  {user.subscription_tier === 'free' ? 'Expires in 24h' : 'Monthly plan'}
                </p>
                <Button size="sm" variant="outline" onClick={() => navigate("/pricing")}>
                  {user.subscription_tier === 'premium' ? 'Manage' : 'Upgrade'}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs" 
              onClick={() => window.open("https://humanlyai.me/support", "_blank")}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Report an Issue
            </Button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b p-4 flex items-center justify-between">
            <div>
              <h1 className="font-bold">HumanlyAI Coach</h1>
              <p className="text-xs text-muted-foreground">
                Personalized for {user.eq_archetype || "you"}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/subscription")}>
              {user.subscription_tier === "free" ? "Upgrade" : "Manage Plan"}
            </Button>
          </div>
          
          <ChatProvider>
            <div className="flex-1 overflow-hidden flex flex-col">
              <ChatUsage />
              <ChatList />
              <ChatInput />
            </div>
          </ChatProvider>
        </div>
      </div>
    </PageLayout>
  );
};

export default ChatPage;
