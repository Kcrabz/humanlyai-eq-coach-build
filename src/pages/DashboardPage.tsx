
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, TrendingUp, Users, Shield, MessageSquare } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { toast } from "sonner";
import { memo, useEffect } from "react";

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

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, refreshAdminStatus } = useAdminCheck();
  
  // Force refresh admin status when dashboard loads
  useEffect(() => {
    if (user?.email) {
      refreshAdminStatus();
    }
  }, [user?.email, refreshAdminStatus]);
  
  // Extract first name from the user's name
  const firstName = user?.name ? user.name.split(" ")[0] : "Friend";
  
  const handleReferral = () => {
    const referralLink = `${window.location.origin}?ref=${user?.id}`;
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied to clipboard!", {
      description: "Share this link with your friends to invite them to join."
    });
  };
  
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
          <ActionCard 
            onClick={() => navigate("/chat")}
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
    </PageLayout>
  );
};

export default memo(DashboardPage);
