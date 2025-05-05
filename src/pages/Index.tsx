
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
      
      // If user is authenticated and onboarded, they should be on chat page
      if (isAuthenticated && user?.onboarded === true) {
        console.log("User is authenticated and onboarded, navigating to chat from Index");
        navigate("/chat", { replace: true });
      }
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  return <LandingPage />;
};

export default Index;
