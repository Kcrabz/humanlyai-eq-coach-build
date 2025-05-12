
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { isOnAuthPage } from "@/utils/navigationUtils";
import { toast } from "sonner";
import { forceRedirectToDashboard, isRunningAsPWA } from "@/utils/loginRedirectUtils";

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
      isPWA: isRunningAsPWA(),
      timestamp: new Date().toISOString()
    });
  }, [user, pathname, authEvent, profileLoaded]);

  // Skip redirects for password reset/update pages
  const isPasswordResetPage = pathname === "/reset-password" || pathname === "/update-password";
  
  // Handle redirects based on authentication status - with loop protection
  useEffect(() => {
    // Only proceed when auth is fully ready
    if (isLoading) {
      console.log("AuthGuard: Auth state is still loading, waiting...");
      return;
    }
    
    // Skip any redirects for password reset/update pages regardless of auth state
    if (isPasswordResetPage) {
      console.log("AuthGuard: On password reset/update page, skipping redirects");
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
    const isPWA = isRunningAsPWA();
    
    console.log("AuthGuard: Navigation logic check", {
      isCurrentlyOnAuth,
      shouldGoToOnboarding,
      shouldGoToDashboard,
      shouldGoToLogin,
      isPWA,
      pathname
    });

    // Handle successful login with direct redirect - but only from auth pages
    if (user && (authEvent === "SIGN_IN_COMPLETE" || authEvent === "RESTORED_SESSION") && profileLoaded) {
      console.log("AuthGuard: Auth event detected, handling login redirect", { authEvent, isPWA });
      
      if (!user.onboarded) {
        // Redirect to onboarding if not already there
        if (pathname !== "/onboarding") {
          console.log("AuthGuard: User not onboarded, redirecting to onboarding");
          
          // For PWA, use a more direct approach to avoid navigation issues
          if (isPWA) {
            setTimeout(() => {
              window.location.href = "/onboarding";
            }, 100);
          } else {
            // Regular navigation for non-PWA
            setTimeout(() => {
              navigate("/onboarding", { replace: true });
            }, 50);
          }
        }
      } else if (isCurrentlyOnAuth) {
        // Only redirect to dashboard after successful login if we're on an auth page
        if (pathname !== "/dashboard") {
          console.log("AuthGuard: User onboarded and on auth page, redirecting to dashboard");
          
          // Use direct window.location for PWA to avoid React Router issues
          if (isPWA) {
            setTimeout(() => {
              forceRedirectToDashboard();
              toast.success(`Welcome back, ${user.name || 'Friend'}!`);
            }, 100);
          } else {
            // Regular navigation for non-PWA
            setTimeout(() => {
              navigate("/dashboard", { replace: true });
              toast.success(`Welcome back, ${user.name || 'Friend'}!`);
            }, 50);
          }
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
      
      // For PWA, use direct location change
      if (isPWA) {
        window.location.href = "/onboarding";
      } else {
        navigate("/onboarding", { replace: true });
      }
    }
    else if (shouldGoToDashboard) {
      console.log("AuthGuard: Redirecting to dashboard");
      
      // For PWA, use direct location change
      if (isPWA) {
        forceRedirectToDashboard();
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, isLoading, pathname, navigate, authEvent, profileLoaded, isPasswordResetPage]);

  // This component doesn't render anything, just handles redirects
  return null;
};
