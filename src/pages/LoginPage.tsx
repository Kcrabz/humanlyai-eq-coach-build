
import { useEffect } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuthState } from "@/services/authService";
import { AuthNavigationService } from "@/services/authNavigationService";

const LoginPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Handle redirection for authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      // Check if there's a specific page to return to
      const authState = getAuthState();
      const returnTo = authState?.returnTo;
      
      if (user.onboarded) {
        // Onboarded users go to dashboard (never directly to chat)
        AuthNavigationService.navigateToDashboard(navigate);
      } else {
        // Non-onboarded users must complete onboarding
        navigate("/onboarding", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);
  
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
