
import { useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { isOnAuthPage, isOnOnboardingPage } from "@/utils/navigationUtils";
import { toast } from "sonner";

/**
 * Global authentication guard component that handles all redirects based on auth state
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

  // Handle redirects based on authentication status
  useEffect(() => {
    // Only proceed when auth is fully ready and profile is loaded if needed
    if (isLoading) {
      console.log("AuthGuard: Auth state is still loading, waiting...");
      return;
    }
    
    // Wait for profile to load after sign-in before redirecting
    if (authEvent === 'SIGN_IN_COMPLETE' && !profileLoaded) {
      console.log("AuthGuard: Auth complete but waiting for profile to load");
      return;
    }

    console.log("AuthGuard: Running redirection check", { 
      isAuthenticated: !!user, 
      pathname,
      userOnboarded: user?.onboarded,
      authEvent,
      profileLoaded,
      timestamp: new Date().toISOString()
    });

    // Handle successful login with direct redirect
    if (user && (authEvent === "SIGNED_IN" || authEvent === "SIGN_IN_COMPLETE") && profileLoaded) {
      console.log("AuthGuard: Auth event detected, redirecting after login");
      
      if (!user.onboarded) {
        console.log("AuthGuard: User not onboarded, redirecting to onboarding");
        window.location.href = "/onboarding";
        toast.success("Welcome! Please complete onboarding to continue.");
        return;
      } else {
        console.log("AuthGuard: User onboarded, redirecting to dashboard");
        window.location.href = "/dashboard";
        toast.success(`Welcome back, ${user.name || 'Friend'}!`);
        return;
      }
    }

    // Standard auth checks
    if (user) {
      // If user is on an auth page (login/signup), redirect to appropriate page
      if (isOnAuthPage(pathname)) {
        console.log("AuthGuard: User is authenticated on auth page, redirecting");
        
        if (!user.onboarded) {
          console.log("AuthGuard: Redirecting to onboarding");
          navigate("/onboarding", { replace: true });
        } else {
          console.log("AuthGuard: Redirecting to dashboard");
          navigate("/dashboard", { replace: true });
        }
      }
      // If user is not onboarded but trying to access pages other than onboarding
      else if (!user.onboarded && !isOnOnboardingPage(pathname) && pathname !== "/") {
        console.log("AuthGuard: User is not onboarded, redirecting to onboarding");
        navigate("/onboarding", { replace: true });
      }
    }
    // User is not authenticated but trying to access protected routes
    else if (!user && pathname !== "/" && !isOnAuthPage(pathname)) {
      console.log("AuthGuard: User is not authenticated on protected route, redirecting to login");
      navigate("/login", { replace: true });
    }
  }, [user, isLoading, pathname, navigate, authEvent, profileLoaded]);

  // This component doesn't render anything, just handles redirects
  return null;
};
