
import { useEffect } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  getAuthFlowState, 
  AuthFlowState,
  clearAuthFlowState
} from "@/services/authFlowService";

const LoginPage = () => {
  const { user, isAuthenticated, authEvent } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Handle navigation on successful login - simplified
  useEffect(() => {
    // Clear any stale auth flow state on component mount
    clearAuthFlowState();
    
    // If user is authenticated, redirect to appropriate page
    if (isAuthenticated && user) {
      console.log("LoginPage: User authenticated, redirecting", { 
        id: user.id, 
        onboarded: user.onboarded
      });
      
      // Direct navigation without delays or toasts
      if (user.onboarded) {
        console.log("LoginPage: Redirecting to dashboard");
        navigate('/dashboard', { replace: true });
      } else {
        console.log("LoginPage: Redirecting to onboarding");
        navigate('/onboarding', { replace: true });
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
