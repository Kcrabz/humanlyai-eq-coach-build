
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { isOnAuthPage } from "@/utils/navigationUtils";
import { toast } from "sonner";

/**
 * Global authentication guard component that handles all redirects based on auth state
 * With improved protection against redirect loops
 */
export const AuthenticationGuard = () => {
  const { user, isLoading, authEvent, profileLoaded } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  
  // Debug logging for session state
  useEffect(() => {
    console.log("AuthGuard: Auth state changed", { 
      isAuthenticated: !!user, 
      pathname,
      userOnboarded: user?.onboarded,
      authEvent,
      profileLoaded,
      timestamp: new Date().toISOString()
    });
  }, [user, pathname, authEvent, profileLoaded]);

  // Handle redirects based on authentication status - with loop protection
  useEffect(() => {
    // Only proceed when auth is fully ready
    if (isLoading) {
      console.log("AuthGuard: Auth state is still loading, waiting...");
      return;
    }
    
    // Critical: Wait for profile to load after sign-in before redirecting
    if (authEvent === 'SIGN_IN_COMPLETE' && !profileLoaded) {
      console.log("AuthGuard: Auth complete but waiting for profile to load");
      return;
    }

    // Skip any redirects if we're already on the right page to prevent loops
    const isCurrentlyOnAuth = isOnAuthPage(pathname);
    const shouldGoToOnboarding = user && !user.onboarded && pathname !== "/onboarding";
    const shouldGoToDashboard = user && user.onboarded && isCurrentlyOnAuth;
    const shouldGoToLogin = !user && pathname !== "/" && !isCurrentlyOnAuth;
    
    console.log("AuthGuard: Navigation logic check", {
      isCurrentlyOnAuth,
      shouldGoToOnboarding,
      shouldGoToDashboard,
      shouldGoToLogin,
      pathname
    });

    // Handle successful login with direct redirect - but only from auth pages
    if (user && (authEvent === "SIGN_IN_COMPLETE" || authEvent === "RESTORED_SESSION") && profileLoaded) {
      console.log("AuthGuard: Auth event detected, handling login redirect", { authEvent });
      
      if (!user.onboarded) {
        // Redirect to onboarding if not already there
        if (pathname !== "/onboarding") {
          console.log("AuthGuard: User not onboarded, redirecting to onboarding");
          // Use a timeout to ensure state updates have completed
          setTimeout(() => {
            navigate("/onboarding", { replace: true });
          }, 50);
        }
      } else if (isCurrentlyOnAuth) {
        // Only redirect to dashboard after successful login if we're on an auth page
        // This prevents interrupting normal navigation on the dashboard and other pages
        if (pathname !== "/dashboard") {
          console.log("AuthGuard: User onboarded and on auth page, redirecting to dashboard");
          // Use a timeout to ensure state updates have completed
          setTimeout(() => {
            navigate("/dashboard", { replace: true });
            toast.success(`Welcome back, ${user.name || 'Friend'}!`);
          }, 50);
        }
      }
      return;
    }

    // Non-login redirects - carefully managed to prevent loops
    if (shouldGoToLogin) {
      console.log("AuthGuard: Redirecting unauthenticated user to login");
      navigate("/login", { replace: true });
    }
    else if (shouldGoToOnboarding) {
      console.log("AuthGuard: Redirecting to onboarding");
      navigate("/onboarding", { replace: true });
    }
    else if (shouldGoToDashboard) {
      console.log("AuthGuard: Redirecting to dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [user, isLoading, pathname, navigate, authEvent, profileLoaded]);

  // This component doesn't render anything, just handles redirects
  return null;
};
