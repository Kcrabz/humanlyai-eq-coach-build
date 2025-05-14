
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LandingPage from "./LandingPage";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Fast path for authenticated users
  useEffect(() => {
    if (!isLoading) {
      // Redirect onboarding users immediately
      if (isAuthenticated && user?.onboarded === false) {
        navigate("/onboarding", { replace: true });
        return;
      }
      
      // Optional: For improved UX, auto-redirect authenticated users to dashboard
      // Uncomment if you want authenticated users to skip landing page
      /*
      if (isAuthenticated && user?.onboarded) {
        navigate("/dashboard", { replace: true });
        return;
      }
      */
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  return <LandingPage />;
};

export default Index;
