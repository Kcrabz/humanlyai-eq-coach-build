
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { isOnAuthPage } from "@/utils/navigationUtils";
import { toast } from "sonner";
import { forceRedirectToDashboard, isRunningAsPWA, wasLoginSuccessful, isFirstLoginAfterLoad } from "@/utils/loginRedirectUtils";

/**
 * Global authentication guard component that handles all redirects based on auth state
 * With improved protection against redirect loops
 */
export const AuthenticationGuard = () => {
  const { user, isLoading, authEvent, profileLoaded } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const isPWA = isRunningAsPWA();
  const justLoggedIn = isFirstLoginAfterLoad();
  
  // Debug logging for session state
  useEffect(() => {
    console.log("AuthGuard: Auth state changed", { 
      isAuthenticated: !!user, 
      pathname,
      userOnboarded: user?.onboarded,
      authEvent,
      profileLoaded,
      isPWA,
      justLoggedIn,
      timestamp: new Date().toISOString()
    });
    
    // For PWA environments, store info about current path if authenticated
    if (isPWA && user && user.onboarded) {
      console.log("AuthGuard: Authenticated in PWA, may need to store path:", pathname);
    }
  }, [user, pathname, authEvent, profileLoaded, isPWA, justLoggedIn]);

  // Skip redirects for password reset/update pages
  const isPasswordResetPage = pathname === "/reset-password" || pathname === "/update-password";
  
  // Handle redirects based on authentication status - with loop protection and PWA awareness
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
    const wasRecentLogin = wasLoginSuccessful();
    
    console.log("AuthGuard: Navigation logic check", {
      isCurrentlyOnAuth,
      shouldGoToOnboarding,
      shouldGoToDashboard,
      shouldGoToLogin,
      wasRecentLogin,
      isPWA,
      pathname,
      justLoggedIn
    });

    // Handle successful login with direct redirect - but only from auth pages
    if (user && (authEvent === "SIGN_IN_COMPLETE" || authEvent === "RESTORED_SESSION" || justLoggedIn) && profileLoaded) {
      console.log("AuthGuard: Auth event detected, handling login redirect", { authEvent, isPWA, justLoggedIn });
      
      if (!user.onboarded) {
        // Redirect to onboarding if not already there
        if (pathname !== "/onboarding") {
          console.log("AuthGuard: User not onboarded, redirecting to onboarding");
          
          // For PWA, use a more direct approach to avoid navigation issues
          if (isPWA) {
            window.location.href = "/onboarding";
            return;
          } else {
            navigate("/onboarding", { replace: true });
            return;
          }
        }
      } else if (isCurrentlyOnAuth || wasRecentLogin || justLoggedIn) {
        // Only redirect to dashboard after successful login if we're on an auth page
        // or if login was recent (to handle the case where React Router navigation fails)
        if (pathname !== "/dashboard") {
          console.log("AuthGuard: User onboarded and recent login, redirecting to dashboard");
          
          // Use direct window.location for PWA to avoid React Router issues
          if (isPWA || justLoggedIn) {
            // For PWA or first login, we'll use direct location change
            // which implements additional PWA-specific handling
            forceRedirectToDashboard();
            toast.success(`Welcome back, ${user.name || 'Friend'}!`);
            return;
          } else {
            try {
              navigate("/dashboard", { replace: true });
              toast.success(`Welcome back, ${user.name || 'Friend'}!`);
              return;
            } catch (e) {
              console.error("Navigation error, using fallback:", e);
              forceRedirectToDashboard();
              return;
            }
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
  }, [user, isLoading, pathname, navigate, authEvent, profileLoaded, isPasswordResetPage, isPWA, justLoggedIn]);

  // This component doesn't render anything, just handles redirects
  return null;
};
