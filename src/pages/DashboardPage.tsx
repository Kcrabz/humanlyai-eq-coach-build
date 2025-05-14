import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, TrendingUp, Users, Shield, MessageSquare } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { memo, useEffect, useState, Suspense } from "react";
import { Loading } from "@/components/ui/loading";
import { clearLoginSuccess } from "@/utils/loginRedirectUtils";

// Memoize card components for performance
const ActionCard = memo(({ 
  onClick, 
  icon: Icon, 
  title, 
  color 
}: { 
  onClick: () => void, 
  icon: any, 
  title: string,
  color: string 
}) => (
  <Card className={`hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-${color}/10`}>
    <CardContent className="p-0">
      <Button 
        variant="ghost" 
        className="w-full h-full p-6 flex flex-col items-center justify-center gap-4 rounded-none" 
        onClick={onClick}
      >
        <div className={`w-16 h-16 rounded-full bg-${color}/10 flex items-center justify-center`}>
          <Icon className={`w-8 h-8 text-${color}`} />
        </div>
        <div className="text-center w-full">
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
      </Button>
    </CardContent>
  </Card>
));

// Loading state component
const DashboardLoading = () => (
  <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
    <Loading size="large" className="text-humanly-teal" />
    <p className="text-muted-foreground animate-pulse">Loading your dashboard...</p>
  </div>
);

const DashboardContent = memo(() => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loaded, setLoaded] = useState(false);
  const { isAdmin, refreshAdminStatus } = useAdminCheck();
  
  // Mark page as loaded for smoother transitions
  useEffect(() => {
    if (!loaded) {
      // Short timeout to prevent UI jank during load
      const timer = setTimeout(() => {
        setLoaded(true);
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [loaded]);
  
  // Force refresh admin status when dashboard loads, but in the background
  useEffect(() => {
    if (user?.email) {
      // Use a microtask to run this after rendering
      setTimeout(() => {
        refreshAdminStatus();
      }, 0);
    }
  }, [user?.email, refreshAdminStatus]);
  
  // Extract first name from the user's name
  const firstName = user?.name ? user.name.split(" ")[0] : "Friend";
  
  const handleReferral = () => {
    const referralLink = `${window.location.origin}?ref=${user?.id}`;
    navigator.clipboard.writeText(referralLink);
  };
  
  const openFeedbackForm = () => {
    window.open("https://docs.google.com/forms/d/e/1FAIpQLSc0P8UJzjOQXHMEldPkXgGBLEMhulCYdaOggLkZMhxzRtI5uQ/viewform?usp=sharing", "_blank");
  };
  
  // Updated navigation to chat page - using direct location change and clearing login success flag
  const handleChatNavigation = () => {
    clearLoginSuccess(); // Clear login success flag to avoid redirect loops
    window.location.href = '/chat'; // Use direct location change
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4 py-8">
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-humanly-indigo to-humanly-teal bg-clip-text text-transparent">
          Welcome back, {firstName}!
        </h1>
        <p className="text-muted-foreground mt-2">
          What would you like to do now?
        </p>
      </div>
      
      {/* Use conditional rendering for smoother loading */}
      <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${loaded ? 'animate-scale-fade-in' : 'opacity-0'}`}>
        {/* Chat with Kai - Fixed navigation */}
        <ActionCard 
          onClick={handleChatNavigation}
          icon={MessageCircle}
          title="Chat with Kai"
          color="humanly-indigo"
        />
        
        {/* Track Your Growth */}
        <ActionCard 
          onClick={() => navigate("/progress")}
          icon={TrendingUp}
          title="Track Your Growth"
          color="humanly-teal"
        />
        
        {/* Help a Friend */}
        <ActionCard 
          onClick={handleReferral}
          icon={Users}
          title="Help a Friend"
          color="humanly-pastel-rose"
        />
        
        {/* Give Feedback */}
        <ActionCard 
          onClick={openFeedbackForm}
          icon={MessageSquare}
          title="Give Feedback"
          color="humanly-pastel-blue"
        />
        
        {/* Admin Portal - Only visible for admin users */}
        {isAdmin && (
          <ActionCard 
            onClick={() => navigate("/admin")}
            icon={Shield}
            title="Admin Portal"
            color="gray-400"
          />
        )}
      </div>
    </div>
  );
});

const DashboardPage = () => {
  const { isLoading, user } = useAuth();
  const [pageReady, setPageReady] = useState(false);
  
  // Delay rendering content until auth is ready
  useEffect(() => {
    if (!isLoading && user) {
      // Short delay to ensure profile is loaded
      const timer = setTimeout(() => {
        setPageReady(true);
      }, 50);
      
      return () => clearTimeout(timer);
    } else if (!isLoading && !user) {
      // No user, so we're ready to show whatever content is appropriate
      setPageReady(true);
    }
  }, [isLoading, user]);

  return (
    <PageLayout>
      {!pageReady || isLoading ? (
        <DashboardLoading />
      ) : (
        <Suspense fallback={<DashboardLoading />}>
          <DashboardContent />
        </Suspense>
      )}
    </PageLayout>
  );
};

export default memo(DashboardPage);
