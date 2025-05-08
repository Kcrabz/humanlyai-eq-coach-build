
import { useEffect, useState, useRef } from "react";
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
  const redirectedRef = useRef(false);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Skip redirects for password reset/update pages
  const isPasswordResetPage = pathname === "/reset-password" || pathname === "/update-password";
  
  // Clear any pending redirect timeout on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  // Handle redirects based on authentication status - with loop protection
  useEffect(() => {
    // Only proceed when auth is fully ready
    if (isLoading) {
      return;
    }
    
    // Skip redirects for password reset/update pages
    if (isPasswordResetPage) {
      return;
    }
    
    // Critical: Wait for profile to load after sign-in before redirecting
    if (authEvent === 'SIGN_IN_COMPLETE' && !profileLoaded) {
      return;
    }

    // Prevent multiple redirects in the same render cycle
    if (redirectedRef.current) {
      return;
    }

    // Skip any redirects if we're already on the right page to prevent loops
    const isCurrentlyOnAuth = isOnAuthPage(pathname);
    const shouldGoToOnboarding = user && !user.onboarded && pathname !== "/onboarding";
    const shouldGoToDashboard = user && user.onboarded && isCurrentlyOnAuth;
    const shouldGoToLogin = !user && pathname !== "/" && !isCurrentlyOnAuth;
    
    // Debug log instead of console
    if (shouldGoToOnboarding || shouldGoToDashboard || shouldGoToLogin) {
      redirectedRef.current = true;
      
      // Add a small delay to prevent rapid redirects
      redirectTimeoutRef.current = setTimeout(() => {
        if (shouldGoToLogin) {
          navigate("/login", { replace: true });
        }
        else if (shouldGoToOnboarding) {
          navigate("/onboarding", { replace: true });
        }
        else if (shouldGoToDashboard) {
          navigate("/dashboard", { replace: true });
          toast.success(`Welcome back, ${user.first_name || user.name || 'Friend'}!`);
        }
        // Reset redirected flag after a redirect
        redirectedRef.current = false;
      }, 100);
    }
  }, [user, isLoading, pathname, navigate, authEvent, profileLoaded, isPasswordResetPage]);

  // This component doesn't render anything, just handles redirects
  return null;
};
