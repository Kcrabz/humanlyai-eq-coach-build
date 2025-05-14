
import { useEffect } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "react-router-dom";
import { AuthNavigationService, NavigationState } from "@/services/authNavigationService";

const LoginPage = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    // Only track authentication state for debugging
    // All navigation is handled by AuthenticationGuard
    if (isAuthenticated && user) {
      console.log("LoginPage: User already authenticated", { 
        id: user.id, 
        onboarded: user.onboarded 
      });
      
      // Set navigation state to authenticated for tracking
      AuthNavigationService.setState(NavigationState.AUTHENTICATED, { 
        userId: user.id, 
        onboarded: user.onboarded 
      });
    }
  }, [isAuthenticated, user]);
  
  return (
    <PageLayout>
      <div className="flex min-h-screen items-center justify-center py-12 animate-scale-fade-in">
        <div className="relative z-10">
          <div className="absolute -z-10 w-full h-full top-0 left-0 transform -translate-x-4 -translate-y-4 bg-humanly-pastel-mint/40 rounded-3xl blur-xl"></div>
          <AuthForm type="login" />
        </div>
      </div>
    </PageLayout>
  );
};

export default LoginPage;
