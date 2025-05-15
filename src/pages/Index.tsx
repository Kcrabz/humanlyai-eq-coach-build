
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LandingPage from "./LandingPage";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      console.log("Index page loaded:", { 
        isAuthenticated, 
        userExists: !!user,
        userOnboarded: user?.onboarded,
        currentUrl: window.location.href 
      });
      
      // We're removing the automatic redirection to chat for authenticated users
      // This allows them to view the landing page even when logged in
      
      // Only redirect if the user is not onboarded yet
      if (isAuthenticated && user?.onboarded === false) {
        console.log("User is authenticated but not onboarded, redirecting to onboarding from Index");
        navigate("/onboarding", { replace: true });
      }
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  return <LandingPage />;
};

export default Index;
