
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

  // Force navigation with location reload if needed
  const forceNavigate = useCallback((to: string, options: Record<string, any> = {}) => {
    console.log(`AuthGuard: Force navigating to ${to}`);
    
    // Try React Router navigation first
    navigate(to, { 
      replace: true, 
      state: { 
        forceRefresh: Date.now(),
        ...(options.state || {})
      },
      ...options 
    });
    
    // As a fallback, if we're still on the same page after a short delay, use window.location
    setTimeout(() => {
      if (window.location.pathname === pathname) {
        console.log(`AuthGuard: React Router navigation failed, using window.location for ${to}`);
        window.location.href = to;
      }
    }, 100);
  }, [navigate, pathname]);

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
    // Only proceed when we're not loading and we have a clear picture of the auth state
    if (isLoading) {
      console.log("AuthGuard: Auth state is still loading, waiting...");
      return;
    }
    
    // Wait until profile is loaded after sign-in before redirecting
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

    // Handle after successful login
    if ((authEvent === "SIGNED_IN" || authEvent === "SIGN_IN_COMPLETE") && profileLoaded) {
      console.log("AuthGuard: Auth event detected, forcing redirect");
      
      // Force redirect after login based on onboarded status
      if (user) {
        if (!user.onboarded) {
          console.log("AuthGuard: User just logged in, redirecting to onboarding");
          forceNavigate("/onboarding");
          toast.success("Welcome! Please complete onboarding to continue.");
          return;
        } else {
          console.log("AuthGuard: User just logged in, redirecting to dashboard");
          forceNavigate("/dashboard");
          toast.success(`Welcome back, ${user.name || 'Friend'}!`);
          return;
        }
      }
    }

    // Standard auth checks
    if (user) {
      // If user is on an auth page (login/signup), redirect to appropriate page
      if (isOnAuthPage(pathname)) {
        console.log("AuthGuard: User is authenticated on auth page, redirecting");
        
        if (!user.onboarded) {
          console.log("AuthGuard: Redirecting to onboarding");
          forceNavigate("/onboarding");
        } else {
          console.log("AuthGuard: Redirecting to dashboard");
          forceNavigate("/dashboard");
        }
      }
      // If user is not onboarded but trying to access pages other than onboarding
      else if (!user.onboarded && !isOnOnboardingPage(pathname) && pathname !== "/") {
        console.log("AuthGuard: User is not onboarded, redirecting to onboarding");
        forceNavigate("/onboarding");
      }
    }
    // User is not authenticated but trying to access protected routes
    else if (!user && pathname !== "/" && !isOnAuthPage(pathname)) {
      console.log("AuthGuard: User is not authenticated on protected route, redirecting to login");
      forceNavigate("/login");
    }
  }, [user, isLoading, pathname, navigate, authEvent, profileLoaded, forceNavigate]);

  // This component doesn't render anything, just handles redirects
  return null;
};
