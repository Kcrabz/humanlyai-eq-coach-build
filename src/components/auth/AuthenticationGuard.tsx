
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { isOnAuthPage } from "@/utils/navigationUtils";
import { toast } from "sonner";
import { 
  forceRedirectToDashboard, 
  isRunningAsPWA, 
  wasLoginSuccessful, 
  isFirstLoginAfterLoad,
  markLoginSuccess 
} from "@/utils/loginRedirectUtils";

/**
 * Optimized authentication guard component with improved performance
 */
export const AuthenticationGuard = () => {
  const { user, isLoading, authEvent, profileLoaded } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const isPWA = isRunningAsPWA();
  const justLoggedIn = isFirstLoginAfterLoad();
  
  // Enhanced login detection for immediate feedback
  useEffect(() => {
    // Show welcome toast immediately when we detect login
    if (user && (authEvent === 'SIGN_IN_COMPLETE' || wasLoginSuccessful() || justLoggedIn)) {
      toast.success(`Welcome back${user.name ? `, ${user.name}` : ''}!`);
      
      // Optimistic UI updates - mark login success early
      if (authEvent === 'SIGN_IN_COMPLETE') {
        markLoginSuccess();
      }
    }
  }, [user, authEvent, justLoggedIn]);
  
  // Optimized main auth redirection effect
  useEffect(() => {
    // Skip if still loading auth state
    if (isLoading) {
      return;
    }
    
    // Skip navigation for password reset pages
    if (pathname === "/reset-password" || pathname === "/update-password") {
      return;
    }
    
    // Skip redirects if we're already on the right page to avoid redirect loops
    const isCurrentlyOnAuth = isOnAuthPage(pathname);
    
    if (user) {
      console.log("AuthGuard: User detected", { 
        authEvent, 
        profileLoaded, 
        onboarded: user.onboarded,
        pathname 
      });
      
      // Handle onboarded vs not onboarded states
      if (!user.onboarded && pathname !== "/onboarding") {
        console.log("Redirecting user to onboarding");
        navigate("/onboarding", { replace: true });
        return;
      } 
      
      // Handle successful login case with higher priority
      if ((authEvent === "SIGN_IN_COMPLETE" || authEvent === "RESTORED_SESSION" || justLoggedIn || wasLoginSuccessful()) 
          && user.onboarded && (isCurrentlyOnAuth || pathname === "/")) {
        console.log("Login success detected, redirecting to dashboard");
        
        // Use immediate redirection methods for snappier UX
        if (isPWA || justLoggedIn) {
          forceRedirectToDashboard();
        } else {
          navigate("/dashboard", { replace: true });
        }
      }
      // Handle already authenticated users on auth pages
      else if (user.onboarded && isCurrentlyOnAuth) {
        console.log("User is already authenticated, redirecting to dashboard");
        if (isPWA) {
          forceRedirectToDashboard();
        } else {
          navigate("/dashboard", { replace: true });
        }
      }
    } 
    // Handle unauthenticated users trying to access protected routes
    else if (!user && pathname !== "/" && !isCurrentlyOnAuth) {
      console.log("User is not authenticated, redirecting to login");
      navigate("/login", { replace: true });
    }
  }, [user, isLoading, pathname, navigate, authEvent, profileLoaded, isPWA, justLoggedIn]);

  return null;
};
