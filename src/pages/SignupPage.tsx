
import { useEffect } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { AuthNavigationService, NavigationState } from "@/services/authNavigationService";

const SignupPage = () => {
  const { user, isAuthenticated } = useAuth();
  
  useEffect(() => {
    // Only for debugging - all navigation is handled by AuthenticationGuard
    if (isAuthenticated && user) {
      console.log("SignupPage: User already authenticated", { 
        id: user.id, 
        onboarded: user.onboarded 
      });
      
      // Set navigation state for newly registered users
      if (!user.onboarded) {
        AuthNavigationService.setState(NavigationState.ONBOARDING, { 
          userId: user.id, 
          fromSignup: true 
        });
      }
    }
  }, [isAuthenticated, user]);
  
  return (
    <PageLayout>
      <div className="flex min-h-screen items-center justify-center py-12 animate-scale-fade-in">
        <div className="relative z-10">
          <div className="absolute -z-10 w-full h-full top-0 left-0 transform -translate-x-4 -translate-y-4 bg-humanly-pastel-lavender/40 rounded-3xl blur-xl"></div>
          <AuthForm type="signup" />
        </div>
      </div>
    </PageLayout>
  );
};

export default SignupPage;
