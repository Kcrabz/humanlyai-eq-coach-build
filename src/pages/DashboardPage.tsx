
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, TrendingUp, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleReferral = () => {
    // Copy a referral link to clipboard
    const referralLink = `${window.location.origin}?ref=${user?.id}`;
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied to clipboard!", {
      description: "Share this link with your friends to invite them to join."
    });
  };
  
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto p-4 py-8">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-humanly-indigo to-humanly-teal bg-clip-text text-transparent">
            Welcome, {user?.name || "Friend"}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Choose what you'd like to do today
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3 animate-scale-fade-in">
          {/* Chat with Kai */}
          <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-humanly-indigo/10">
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
          </Card>
          
          {/* Track Your Growth */}
          <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-humanly-teal/10">
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
          </Card>
          
          {/* Help a Friend (formerly "Refer a Fellow Human") */}
          <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-humanly-pastel-rose/20">
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
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default DashboardPage;
