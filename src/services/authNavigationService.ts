
import { NavigateFunction } from "react-router-dom";
import { User } from "@/types";

// Constants for authentication flow
const AUTH_STATE_STABILIZE_DELAY = 200; // ms to wait for auth state to stabilize

/**
 * Centralized auth navigation service - Version 2.0
 * Completely refactored to eliminate navigation conflicts and race conditions
 */
export const AuthNavigationService = {
  /**
   * Handle post-login navigation with smooth transition
   */
  handleSuccessfulLogin: (navigate: NavigateFunction, userId?: string): void => {
    console.log(`AuthNavigationService: Handling successful login for user: ${userId || 'unknown'}`);
    
    // Set a session flag to prevent other navigation handlers from interfering
    sessionStorage.setItem('auth_navigation_in_progress', 'login_success');
    
    // Navigate directly to dashboard - simplified flow
    setTimeout(() => {
      console.log(`AuthNavigationService: Navigating to dashboard after login`);
      navigate("/dashboard", { replace: true });
      
      // Clear navigation flag after navigation completes
      setTimeout(() => {
        sessionStorage.removeItem('auth_navigation_in_progress');
      }, 500);
    }, AUTH_STATE_STABILIZE_DELAY);
  },
  
  /**
   * Check if navigation service is handling a transition
   */
  isHandlingNavigation: (): boolean => {
    return !!sessionStorage.getItem('auth_navigation_in_progress');
  },
  
  /**
   * Navigate to chat page with intentional navigation marker
   */
  navigateToChat: (navigate: NavigateFunction): void => {
    // Set intention flag directly in session storage (more reliable than localStorage)
    sessionStorage.setItem('auth_navigation_in_progress', 'to_chat');
    
    // Navigate and clear flag after navigation completes
    navigate("/chat");
    
    setTimeout(() => {
      sessionStorage.removeItem('auth_navigation_in_progress');
    }, 500);
  },
  
  /**
   * Clear all navigation flags and states
   */
  clearNavigationState: (): void => {
    sessionStorage.removeItem('auth_navigation_in_progress');
    localStorage.removeItem('intentional_navigation_to_chat');
  }
};

/**
 * Path checking utilities
 */
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

export const isRetakingAssessment = (searchParams?: string): boolean => {
  if (searchParams) {
    const urlSearchParams = new URLSearchParams(searchParams);
    return urlSearchParams.get('step') === 'archetype';
  }
  
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    return url.searchParams.get('step') === 'archetype';
  }
  
  return false;
};
