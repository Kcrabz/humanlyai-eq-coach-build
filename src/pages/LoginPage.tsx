
import { useEffect } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  getAuthFlowState, 
  AuthFlowState,
  isPwaMode,
  isMobileDevice
} from "@/services/authFlowService";

const LoginPage = () => {
  const { user, isAuthenticated, authEvent } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Handle navigation on successful login
  useEffect(() => {
    // Check for auth flow state indicating successful login
    const authState = getAuthFlowState();
    const isLoginSuccess = authState?.state === AuthFlowState.SUCCESS;
    
    // Log detailed information for debugging
    if (isPwaMode() || isMobileDevice()) {
      console.log("LoginPage: Environment detection", { 
        isPwa: isPwaMode(),
        isMobile: isMobileDevice(),
        isAuthenticated, 
        userId: user?.id,
        authEvent,
        pathname: location.pathname,
        authState: authState?.state
      });
    }
    
    // Handle authentication state
    if (isAuthenticated && user) {
      console.log("LoginPage: User already authenticated", { 
        id: user.id, 
        onboarded: user.onboarded,
        isPwa: isPwaMode(),
        isMobile: isMobileDevice()
      });
      
      // If we have a successful login event and a user, redirect
      if (authEvent === "SIGN_IN_COMPLETE" || isLoginSuccess) {
        // Provide visual feedback
        toast.success("Login successful! Redirecting...");
        
        // Add a delay to ensure UI state is updated
        setTimeout(() => {
          if (user.onboarded) {
            console.log("LoginPage: Redirecting to dashboard");
            navigate('/dashboard', { replace: true });
          } else {
            console.log("LoginPage: Redirecting to onboarding");
            navigate('/onboarding', { replace: true });
          }
        }, 500);
      }
    }
  }, [isAuthenticated, user, authEvent, location.pathname, navigate]);
  
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
