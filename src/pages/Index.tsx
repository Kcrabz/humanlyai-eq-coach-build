
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LandingPage from "./LandingPage";
import { useAuth } from "@/context/AuthContext";
import { Loading } from "@/components/ui/loading";

const Index = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Fast path for authenticated users with reduced checks
  useEffect(() => {
    // Skip if still loading
    if (isLoading) return;
    
    if (isAuthenticated) {
      // Redirect onboarding users immediately
      if (user && !user.onboarded) {
        console.log("Root page - Redirecting to onboarding");
        navigate("/onboarding", { replace: true });
        return;
      }
      
      // Redirect authenticated + onboarded users to dashboard
      if (user && user.onboarded) {
        console.log("Root page - Redirecting to dashboard");
        navigate("/dashboard", { replace: true });
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading size="large" />
      </div>
    );
  }

  return <LandingPage />;
};

export default Index;
