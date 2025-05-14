import { NavigateFunction } from "react-router-dom";
import { User } from "@/types";

// Constants for timer management and authentication flow
const LOGIN_REDIRECT_DELAY = 800; // ms to wait before redirecting after login
const AUTH_STATE_STABILIZE_DELAY = 200; // ms to wait for auth state to stabilize

/**
 * Centralized auth navigation service
 * This service centralizes all authentication-related navigation decisions
 * to prevent conflicts between different components trying to redirect simultaneously
 */
export const AuthNavigationService = {
  /**
   * Handle post-login navigation with proper delay to ensure auth state is stable
   * @param navigate React Router navigation function
   * @param userId Optional user ID for logging
   */
  handleSuccessfulLogin: (navigate: NavigateFunction, userId?: string): void => {
    console.log(`AuthNavigationService: Handling successful login for user: ${userId || 'unknown'}`);
    
    // Mark that this service is handling the navigation to prevent conflicts
    sessionStorage.setItem('auth_navigation_handling_login', 'true');
    
    // Use a longer delay to ensure auth state is fully loaded
    setTimeout(() => {
      console.log(`AuthNavigationService: Navigating to dashboard after login delay`);
      navigate("/dashboard", { replace: true });
      
      // Clear flag after navigation is triggered
      setTimeout(() => {
        sessionStorage.removeItem('auth_navigation_handling_login');
      }, 1000);
    }, LOGIN_REDIRECT_DELAY);
  },
  
  /**
   * Check if the navigation service is currently handling a login redirect
   * Used by AuthenticationGuard to avoid interference
   */
  isHandlingLoginNavigation: (): boolean => {
    return sessionStorage.getItem('auth_navigation_handling_login') === 'true';
  },
  
  /**
   * Handle navigation for authenticated users
   * Directs to appropriate page based on onboarding status
   */
  handleAuthenticatedNavigation: (
    user: User,
    pathname: string,
    navigate: NavigateFunction,
    isRetaking: boolean = false
  ): void => {
    // Skip if navigation service is currently handling login
    if (AuthNavigationService.isHandlingLoginNavigation()) {
      console.log(`AuthNavigationService: Skipping navigation as login handler is active`);
      return;
    }
    
    // Skip navigation for auth pages to prevent redirect loops
    if (isOnAuthPage(pathname)) {
      console.log("AuthNavigationService: On auth page, skipping navigation");
      return;
    }
    
    // Special case: User is retaking assessment, allow access to onboarding regardless of onboarded status
    if (isRetaking && isOnOnboardingPage(pathname)) {
      console.log("AuthNavigationService: User is retaking assessment, allowing access to onboarding page");
      return;
    }
    
    // Authenticated but not onboarded -> redirect to onboarding
    if (user.onboarded === false && !isOnOnboardingPage(pathname)) {
      console.log("AuthNavigationService: User is authenticated but not onboarded, redirecting to onboarding");
      navigate("/onboarding", { replace: true });
      return;
    }
    
    // Authenticated and onboarded -> redirect from onboarding to dashboard UNLESS retaking assessment
    if (user.onboarded === true && isOnOnboardingPage(pathname) && !isRetaking) {
      console.log("AuthNavigationService: User is authenticated and onboarded on onboarding page, redirecting to dashboard");
      navigate("/dashboard", { replace: true });
      return;
    }
    
    // Authenticated users should be redirected from auth pages to dashboard
    if (user.onboarded === true && isOnAuthPage(pathname)) {
      console.log("AuthNavigationService: Authenticated user on auth page, redirecting to dashboard");
      navigate("/dashboard", { replace: true });
      return;
    }
  },
  
  /**
   * Handle navigation for unauthenticated users
   */
  handleUnauthenticatedNavigation: (
    pathname: string,
    navigate: NavigateFunction
  ): void => {
    // Skip if navigation service is currently handling login
    if (AuthNavigationService.isHandlingLoginNavigation()) {
      return;
    }
    
    // Skip navigation for auth pages and root to prevent redirect loops
    if (isOnAuthPage(pathname) || pathname === "/") {
      return;
    }
    
    // Redirect from protected routes to login
    console.log("AuthNavigationService: Unauthenticated user on protected route, redirecting to login");
    navigate("/login", { replace: true });
  }
};

// Utility functions for path checking
export const isOnOnboardingPage = (pathname: string): boolean => {
  return pathname === "/onboarding";
};

export const isOnAuthPage = (pathname: string): boolean => {
  return pathname === "/login" || 
         pathname === "/signup" || 
         pathname === "/reset-password" || 
         pathname === "/update-password" || 
         pathname === "/forgot-password";
};

export const isOnChatPage = (pathname: string): boolean => {
  return pathname === "/chat";
};

export const isOnDashboardPage = (pathname: string): boolean => {
  return pathname === "/dashboard";
};

/**
 * Determines if the current URL is for retaking the assessment
 */
export const isRetakingAssessment = (searchParams?: string): boolean => {
  // If search params are provided, parse them
  if (searchParams) {
    const urlSearchParams = new URLSearchParams(searchParams);
    return urlSearchParams.get('step') === 'archetype';
  }
  
  // Otherwise check current window location
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    return url.searchParams.get('step') === 'archetype';
  }
  
  return false;
};
