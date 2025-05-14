
import { useEffect } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { setAuthState, AuthState } from "@/services/authService";

const SignupPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Direct users appropriately based on auth status
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.onboarded) {
        // Already onboarded users go to dashboard
        navigate("/dashboard", { replace: true });
      } else {
        // Set auth state for newly registered users
        setAuthState(AuthState.NEEDS_ONBOARDING);
        // Send to onboarding
        navigate("/onboarding", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);
  
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
