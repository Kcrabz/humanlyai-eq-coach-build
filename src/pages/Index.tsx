
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LandingPage from "./LandingPage";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Fast path for authenticated users to dashboard
  useEffect(() => {
    if (!isLoading) {
      console.log("Index page loaded:", { 
        isAuthenticated, 
        userExists: !!user,
        userOnboarded: user?.onboarded,
        currentUrl: window.location.href 
      });
      
      // Redirect onboarding users immediately
      if (isAuthenticated && user?.onboarded === false) {
        console.log("User is authenticated but not onboarded, redirecting to onboarding from Index");
        navigate("/onboarding", { replace: true });
        return;
      }
      
      // Optional: For improved UX, auto-redirect authenticated users to dashboard
      // Uncomment if you want authenticated users to skip landing page
      /*
      if (isAuthenticated && user?.onboarded) {
        console.log("User is authenticated and onboarded, redirecting to dashboard from Index");
        navigate("/dashboard", { replace: true });
        return;
      }
      */
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  return <LandingPage />;
};

export default Index;
