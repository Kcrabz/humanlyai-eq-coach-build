
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, TrendingUp, Users, Shield, MessageSquare } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { toast } from "sonner";
import { useEffect } from "react";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isLoading: isAdminCheckLoading, refreshAdminStatus } = useAdminCheck();
  
  // Add logging to verify admin status on dashboard
  console.log("Dashboard admin status:", { isAdmin, isAdminCheckLoading, userEmail: user?.email });
  
  // Force refresh admin status when dashboard is loaded
  useEffect(() => {
    if (user?.email) {
      console.log("DashboardPage - Refreshing admin status for:", user.email);
      refreshAdminStatus();
    }
  }, [user?.email, refreshAdminStatus]);
  
  // Extract first name from the user's name
  const firstName = user?.name ? user.name.split(" ")[0] : "Friend";
  
  const handleReferral = () => {
    // Copy a referral link to clipboard
    const referralLink = `${window.location.origin}?ref=${user?.id}`;
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied to clipboard!", {
      description: "Share this link with your friends to invite them to join."
    });
  };
  
  // Function to open the feedback form in a new tab
  const openFeedbackForm = () => {
    window.open("https://docs.google.com/forms/d/e/1FAIpQLSc0P8UJzjOQXHMEldPkXgGBLEMhulCYdaOggLkZMhxzRtI5uQ/viewform?usp=sharing", "_blank");
  };
  
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto p-4 py-8">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-humanly-indigo to-humanly-teal bg-clip-text text-transparent">
            Welcome back, {firstName}!
          </h1>
          <p className="text-muted-foreground mt-2">
            What would you like to do now?
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-scale-fade-in">
          {/* Chat with Kai */}
          <EnhancedCard className="border-humanly-indigo/10">
            <CardContent className="p-0">
              <Button 
                variant="ghost" 
                className="w-full h-full p-6 flex flex-col items-center justify-center gap-4 rounded-none" 
                onClick={() => navigate("/chat")}
              >
                <div className="w-16 h-16 rounded-full bg-humanly-indigo/10 flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-humanly-indigo" />
                </div>
                <div className="text-center w-full">
                  <h2 className="text-xl font-semibold">Chat with Kai</h2>
                </div>
              </Button>
            </CardContent>
          </EnhancedCard>
          
          {/* Track Your Growth */}
          <EnhancedCard className="border-humanly-teal/10">
            <CardContent className="p-0">
              <Button 
                variant="ghost" 
                className="w-full h-full p-6 flex flex-col items-center justify-center gap-4 rounded-none" 
                onClick={() => navigate("/progress")}
              >
                <div className="w-16 h-16 rounded-full bg-humanly-teal/10 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-humanly-teal" />
                </div>
                <div className="text-center w-full">
                  <h2 className="text-xl font-semibold">Track Your Growth</h2>
                </div>
              </Button>
            </CardContent>
          </EnhancedCard>
          
          {/* Help a Friend */}
          <EnhancedCard className="border-humanly-pastel-rose/20">
            <CardContent className="p-0">
              <Button 
                variant="ghost" 
                className="w-full h-full p-6 flex flex-col items-center justify-center gap-4 rounded-none" 
                onClick={handleReferral}
              >
                <div className="w-16 h-16 rounded-full bg-humanly-pastel-rose/20 flex items-center justify-center">
                  <Users className="w-8 h-8 text-humanly-indigo" />
                </div>
                <div className="text-center w-full">
                  <h2 className="text-xl font-semibold">Help a Friend</h2>
                </div>
              </Button>
            </CardContent>
          </EnhancedCard>
          
          {/* Give Feedback - new card for beta testers */}
          <EnhancedCard className="border-humanly-pastel-blue/20">
            <CardContent className="p-0">
              <Button 
                variant="ghost" 
                className="w-full h-full p-6 flex flex-col items-center justify-center gap-4 rounded-none" 
                onClick={openFeedbackForm}
              >
                <div className="w-16 h-16 rounded-full bg-humanly-pastel-blue/20 flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-humanly-teal" />
                </div>
                <div className="text-center w-full">
                  <h2 className="text-xl font-semibold">Give Feedback</h2>
                </div>
              </Button>
            </CardContent>
          </EnhancedCard>
          
          {/* Admin Portal - Only visible for admin users */}
          {isAdmin && (
            <EnhancedCard className="border-gray-400/20">
              <CardContent className="p-0">
                <Button 
                  variant="ghost" 
                  className="w-full h-full p-6 flex flex-col items-center justify-center gap-4 rounded-none" 
                  onClick={() => {
                    console.log("Admin portal access requested by:", user?.email);
                    navigate("/admin");
                  }}
                >
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-gray-700" />
                  </div>
                  <div className="text-center w-full">
                    <h2 className="text-xl font-semibold">Admin Portal</h2>
                  </div>
                </Button>
              </CardContent>
            </EnhancedCard>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default DashboardPage;
