
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { isOnAuthPage } from "@/utils/navigationUtils";
import { toast } from "sonner";
import { forceRedirectToDashboard, isRunningAsPWA, wasLoginSuccessful, isFirstLoginAfterLoad } from "@/utils/loginRedirectUtils";

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
  
  // Optimized main auth redirection effect with reduced computations
  useEffect(() => {
    // Skip if still loading
    if (isLoading) {
      return;
    }
    
    // Skip navigation for password reset pages
    if (pathname === "/reset-password" || pathname === "/update-password") {
      return;
    }
    
    // Critical: Wait for profile to load after sign-in before redirecting
    if (authEvent === 'SIGN_IN_COMPLETE' && !profileLoaded) {
      return;
    }

    // Skip redirects if we're already on the right page
    const isCurrentlyOnAuth = isOnAuthPage(pathname);
    
    // Use memoized variables for performance
    if (user) {
      // Handle successful login with profile loaded
      if ((authEvent === "SIGN_IN_COMPLETE" || authEvent === "RESTORED_SESSION" || justLoggedIn) && profileLoaded) {
        // If not onboarded, go to onboarding
        if (!user.onboarded) {
          if (pathname !== "/onboarding") {
            if (isPWA) {
              window.location.href = "/onboarding";
            } else {
              navigate("/onboarding", { replace: true });
            }
          }
        } 
        // If onboarded and on auth page, go to dashboard
        else if (isCurrentlyOnAuth || wasLoginSuccessful() || justLoggedIn) {
          if (pathname !== "/dashboard") {
            if (isPWA || justLoggedIn) {
              forceRedirectToDashboard();
              toast.success(`Welcome back, ${user.name || 'Friend'}!`);
            } else {
              navigate("/dashboard", { replace: true });
              toast.success(`Welcome back, ${user.name || 'Friend'}!`);
            }
          }
        }
        return;
      }

      // Handle onboarded vs not onboarded states
      if (!user.onboarded && pathname !== "/onboarding") {
        navigate("/onboarding", { replace: true });
      } 
      else if (user.onboarded && isCurrentlyOnAuth) {
        if (isPWA) {
          forceRedirectToDashboard();
        } else {
          navigate("/dashboard", { replace: true });
        }
      }
    } 
    // Not authenticated -> redirect to login
    else if (!user && pathname !== "/" && !isCurrentlyOnAuth) {
      navigate("/login", { replace: true });
    }
  }, [user, isLoading, pathname, navigate, authEvent, profileLoaded, isPWA, justLoggedIn]);

  return null;
};
