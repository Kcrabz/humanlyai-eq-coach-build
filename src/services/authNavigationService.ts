
import { NavigateFunction } from "react-router-dom";
import { User } from "@/types";

// Navigation state management
const NAV_STATE_KEY = "auth_navigation_state";
const NAVIGATION_TIMEOUT = 500; // ms to wait for navigation to complete

/**
 * Navigation states for centralized control
 */
export enum NavigationState {
  INITIAL = "initial",
  AUTHENTICATING = "authenticating",
  AUTHENTICATED = "authenticated",
  ONBOARDING = "onboarding",
  DASHBOARD_READY = "dashboard_ready",
  NAVIGATING_TO_CHAT = "navigating_to_chat",
  ERROR = "error"
}

/**
 * Centralized auth navigation service - Version 3.0
 * Complete rewrite to fix navigation issues and ensure
 * consistent HOME -> LOGIN/SIGNUP -> ONBOARDING? -> DASHBOARD -> CHAT flow
 */
export const AuthNavigationService = {
  /**
   * Set the current navigation state
   */
  setState: function(state: NavigationState, metadata?: Record<string, any>): void {
    try {
      const data = {
        state,
        timestamp: Date.now(),
        ...(metadata || {})
      };
      
      console.log(`AuthNav: Setting state to ${state}`, metadata);
      sessionStorage.setItem(NAV_STATE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to set navigation state", e);
    }
  },
  
  /**
   * Get the current navigation state
   */
  getState: function(): { state: NavigationState, timestamp: number, [key: string]: any } | null {
    try {
      const data = sessionStorage.getItem(NAV_STATE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error("Failed to get navigation state", e);
    }
    return null;
  },
  
  /**
   * Clear the current navigation state
   */
  clearState: function(): void {
    try {
      console.log("AuthNav: Clearing navigation state");
      sessionStorage.removeItem(NAV_STATE_KEY);
    } catch (e) {
      console.error("Failed to clear navigation state", e);
    }
  },
  
  /**
   * Handle post-login navigation with proper state transitions
   */
  handleSuccessfulAuth: function(navigate: NavigateFunction, user: User | null, fromSignup: boolean = false): void {
    console.log(`AuthNav: Handling successful auth for user:`, { id: user?.id, onboarded: user?.onboarded, fromSignup });
    
    this.setState(NavigationState.AUTHENTICATED, { userId: user?.id, fromSignup });
    
    // Wait for auth state to stabilize
    setTimeout(() => {
      // If user needs onboarding, go there first
      if (user && !user.onboarded) {
        console.log(`AuthNav: User needs onboarding, redirecting to onboarding`);
        this.setState(NavigationState.ONBOARDING, { userId: user.id });
        navigate("/onboarding", { replace: true });
        return;
      }
      
      // Otherwise go directly to dashboard
      console.log(`AuthNav: User is onboarded, redirecting to dashboard`);
      this.setState(NavigationState.DASHBOARD_READY, { userId: user?.id });
      navigate("/dashboard", { replace: true });
      
      // Clear navigation state after redirect completes
      setTimeout(() => this.clearState(), NAVIGATION_TIMEOUT);
    }, 100);
  },
  
  /**
   * Navigate to chat page with intentional navigation marker
   */
  navigateToChat: function(navigate: NavigateFunction): void {
    console.log("AuthNav: Explicitly navigating to chat from dashboard");
    this.setState(NavigationState.NAVIGATING_TO_CHAT, { fromDashboard: true });
    
    // Navigate and clear state after navigation completes
    navigate("/chat", { replace: false });
    
    setTimeout(() => {
      this.clearState();
    }, NAVIGATION_TIMEOUT);
  },
  
  /**
   * Navigate to dashboard with navigation marker
   */
  navigateToDashboard: function(navigate: NavigateFunction): void {
    console.log("AuthNav: Explicitly navigating to dashboard");
    this.setState(NavigationState.DASHBOARD_READY);
    
    // Navigate and clear state after navigation completes
    navigate("/dashboard", { replace: true });
    
    setTimeout(() => {
      this.clearState();
    }, NAVIGATION_TIMEOUT);
  },
  
  /**
   * Check if current state matches expected state
   */
  isInState: function(state: NavigationState): boolean {
    const navState = this.getState();
    return navState?.state === state;
  },
  
  /**
   * Check if navigation was intentionally directed to chat
   */
  wasIntentionalNavigationToChat: function(): boolean {
    const navState = this.getState();
    return navState?.state === NavigationState.NAVIGATING_TO_CHAT && !!navState?.fromDashboard;
  },
  
  /**
   * Check if current state is from a fresh authentication
   */
  isFromAuthentication: function(): boolean {
    const navState = this.getState();
    if (!navState) return false;
    
    // Check if authenticated within the last 5 seconds
    const isRecent = (Date.now() - navState.timestamp) < 5000;
    
    return (navState.state === NavigationState.AUTHENTICATED || 
            navState.state === NavigationState.DASHBOARD_READY) && 
           isRecent;
  },
  
  /**
   * Clear all navigation flags and states
   */
  resetAllNavigationState: function(): void {
    console.log("AuthNav: Resetting all navigation state");
    this.clearState();
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

export const isHomePage = (pathname: string): boolean => {
  return pathname === "/";
};

export const isPublicPage = (pathname: string): boolean => {
  return isHomePage(pathname) || 
         isOnAuthPage(pathname) || 
         pathname === "/pricing" || 
         pathname === "/about";
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
