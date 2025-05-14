
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
 * Optimized authentication guard with reduced checks for faster performance
 */
export const AuthenticationGuard = () => {
  const { user, isLoading, authEvent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  
  // Handle immediate welcome toast for better UX
  useEffect(() => {
    if (user && (authEvent === 'SIGN_IN_COMPLETE' || wasLoginSuccessful() || isFirstLoginAfterLoad())) {
      // Show welcome toast
      toast.success(`Welcome back${user.name ? `, ${user.name}` : ''}!`);
      
      // Mark login as successful for redirects
      if (authEvent === 'SIGN_IN_COMPLETE') {
        markLoginSuccess();
        
        // Fast path: redirect to dashboard immediately if on login page
        if (isOnAuthPage(pathname)) {
          console.log("Redirecting to dashboard from auth page after login");
          navigate("/dashboard", { replace: true });
        }
      }
    }
  }, [user, authEvent, pathname, navigate]);
  
  // Main auth redirection effect - simplified for performance
  useEffect(() => {
    console.log("AuthGuard checking state:", { 
      isLoading, 
      user: user?.id ? "Yes" : "No", 
      path: pathname, 
      authEvent,
      onboarded: user?.onboarded
    });
    
    // Skip if still loading auth state
    if (isLoading) return;
    
    // Skip navigation for password reset pages
    if (pathname === "/reset-password" || pathname === "/update-password") return;
    
    // Skip redirects if we're already on the right page
    const isCurrentlyOnAuth = isOnAuthPage(pathname);
    
    if (user) {
      console.log("User is authenticated on path:", pathname);
      // Priority path: Redirect to onboarding if not onboarded
      if (!user.onboarded && pathname !== "/onboarding") {
        console.log("Redirecting to onboarding");
        navigate("/onboarding", { replace: true });
        return;
      } 
      
      // Handle authenticated users on auth pages - direct them to dashboard
      if (user.onboarded && isCurrentlyOnAuth) {
        console.log("Authenticated user on auth page, redirecting to dashboard");
        navigate("/dashboard", { replace: true });
      }

      // Handle root path - redirect to dashboard for authenticated users
      if (user.onboarded && pathname === "/") {
        console.log("Authenticated user on root page, redirecting to dashboard");
        navigate("/dashboard", { replace: true });
      }
    } 
    // Simple case: Unauthenticated users trying to access protected routes
    else if (!user && pathname !== "/" && !isCurrentlyOnAuth) {
      console.log("Unauthenticated user on protected route, redirecting to login");
      navigate("/login", { replace: true });
    }
  }, [user, isLoading, pathname, navigate, authEvent]);

  return null;
};
