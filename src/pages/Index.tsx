
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LandingPage from "./LandingPage";
import { useAuth } from "@/context/AuthContext";
import { Loading } from "@/components/ui/loading";

const Index = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Simple redirect logic for authenticated users
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Redirect onboarding users
      if (user && !user.onboarded) {
        console.log("Root page - Redirecting to onboarding");
        navigate("/onboarding", { replace: true });
        return;
      }
      
      // Redirect authenticated users to dashboard
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
