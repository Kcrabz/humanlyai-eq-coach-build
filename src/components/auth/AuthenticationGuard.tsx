
import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { wasLoginSuccessful, clearLoginSuccess } from "@/utils/loginRedirectUtils";
import { AuthNavigationService, isOnAuthPage, isRetakingAssessment } from "@/services/authNavigationService";

/**
 * Enhanced authentication guard that uses the centralized AuthNavigationService
 */
export const AuthenticationGuard = () => {
  const { user, isLoading, authEvent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const loginToastShownRef = useRef(false);
  const justLoggedInRef = useRef(wasLoginSuccessful());
  const redirectAttemptCount = useRef(0);
  const lastPathRef = useRef(pathname);
  
  // Reset redirect tracking when path changes
  useEffect(() => {
    if (lastPathRef.current !== pathname) {
      redirectAttemptCount.current = 0;
      lastPathRef.current = pathname;
      loginToastShownRef.current = false;
    }
  }, [pathname]);
  
  // Show welcome toast on successful login
  useEffect(() => {
    if (user && (authEvent === 'SIGN_IN_COMPLETE') && !loginToastShownRef.current) {
      const firstName = user?.name ? user.name.split(" ")[0] : '';
      toast.success(`Welcome back${firstName ? `, ${firstName}` : ''}!`);
      loginToastShownRef.current = true;
    }
  }, [user, authEvent]);
  
  // Main auth redirection effect - improved for reliability
  useEffect(() => {
    // Skip if still loading auth state
    if (isLoading) return;
    
    // Safety limit for redirect attempts
    redirectAttemptCount.current += 1;
    if (redirectAttemptCount.current > 15) {
      console.warn("Too many redirect attempts, breaking the loop", {
        path: pathname,
        hasUser: !!user,
        attempts: redirectAttemptCount.current
      });
      return;
    }
    
    console.log("AuthGuard checking state:", { 
      isLoading, 
      hasUser: !!user, 
      path: pathname, 
      authEvent,
      onboarded: user?.onboarded,
      attempts: redirectAttemptCount.current,
      justLoggedIn: justLoggedInRef.current,
    });
    
    // Skip navigation for password reset pages
    if (pathname === "/reset-password" || pathname === "/update-password") return;
    
    // Skip navigation immediately after login as the form will handle navigation
    if (justLoggedInRef.current) {
      console.log("User just logged in, letting login form handle redirection");
      
      // If we're on dashboard after login, clear the flag
      if (pathname === "/dashboard") {
        console.log("On dashboard after login, clearing login success flag");
        justLoggedInRef.current = false;
        clearLoginSuccess();
      }
      return;
    }
    
    // Skip navigation if the AuthNavigationService is currently handling login
    if (AuthNavigationService.isHandlingLoginNavigation()) {
      console.log("Auth navigation service is handling login, skipping AuthGuard navigation");
      return;
    }
    
    // Check if user is specifically retaking the assessment
    const isRetaking = isRetakingAssessment(location.search);
    
    if (user) {
      // Let the AuthNavigationService handle navigation for authenticated users
      AuthNavigationService.handleAuthenticatedNavigation(user, pathname, navigate, isRetaking);
    } else {
      // Let the AuthNavigationService handle navigation for unauthenticated users
      AuthNavigationService.handleUnauthenticatedNavigation(pathname, navigate);
    }
  }, [user, isLoading, pathname, navigate, authEvent, location.search]);

  return null;
};
