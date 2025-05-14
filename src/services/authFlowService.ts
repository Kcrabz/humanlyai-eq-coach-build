
/**
 * Centralized service to handle authentication and login flows
 * This provides a single source of truth for authentication state
 * and handles navigation after successful authentication.
 */

import { User } from "@/types";
import { NavigateFunction } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Login flow states
export enum AuthFlowState {
  INITIAL = "initial",
  AUTHENTICATING = "authenticating", 
  SUCCESS = "success",
  ERROR = "error",
  REDIRECTING = "redirecting",
  COMPLETE = "complete"
}

// Centralized state storage
const AUTH_FLOW_KEY = "auth_flow_state";

/**
 * Set the current authentication flow state with optional metadata
 */
export const setAuthFlowState = (state: AuthFlowState, metadata: Record<string, any> = {}): void => {
  try {
    const data = {
      state,
      timestamp: Date.now(),
      ...metadata
    };
    
    console.log(`AuthFlow: Setting state to ${state}`, metadata);
    sessionStorage.setItem(AUTH_FLOW_KEY, JSON.stringify(data));
    
    // Add special flag for mobile/PWA that's easier to detect
    if (state === AuthFlowState.SUCCESS) {
      sessionStorage.setItem('login_success', 'true');
    }
  } catch (e) {
    console.error("Failed to set auth flow state", e);
  }
};

/**
 * Get the current authentication flow state
 */
export const getAuthFlowState = (): { state: AuthFlowState, timestamp: number, [key: string]: any } | null => {
  try {
    const data = sessionStorage.getItem(AUTH_FLOW_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to get auth flow state", e);
  }
  return null;
};

/**
 * Clear all authentication flow state
 */
export const clearAuthFlowState = (): void => {
  try {
    sessionStorage.removeItem(AUTH_FLOW_KEY);
    sessionStorage.removeItem('login_success');
    sessionStorage.removeItem('login_redirect_pending');
    sessionStorage.removeItem('just_logged_in');
  } catch (e) {
    console.error("Failed to clear auth flow state", e);
  }
};

/**
 * Detect whether the app is running in PWA mode
 */
export const isPwaMode = (): boolean => {
  try {
    // Using multiple detection methods for reliability
    return (
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true ||
      localStorage.getItem('is_pwa_mode') === 'true'
    );
  } catch (e) {
    return false;
  }
};

/**
 * Detect whether the app is running on a mobile device
 */
export const isMobileDevice = (): boolean => {
  try {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  } catch (e) {
    return false;
  }
};

/**
 * Unified login handler to ensure consistent behavior
 */
export const handleSuccessfulLogin = async (
  navigate: NavigateFunction, 
  user: User | null
): Promise<void> => {
  // Early return if already redirecting
  if (getAuthFlowState()?.state === AuthFlowState.REDIRECTING) {
    return;
  }
  
  setAuthFlowState(AuthFlowState.SUCCESS, { 
    userId: user?.id,
    timestamp: Date.now(),
    isPwa: isPwaMode(),
    isMobile: isMobileDevice()
  });
  
  // Always show toast - better user experience
  toast.success("Login successful!");
  
  // Mark login success for other components to detect
  sessionStorage.setItem('login_success', 'true');
  sessionStorage.setItem('just_logged_in', 'true');

  try {
    // Set redirecting state to prevent duplicate navigation
    setAuthFlowState(AuthFlowState.REDIRECTING, {
      userId: user?.id,
      timestamp: Date.now() 
    });
    
    // Wait a moment to ensure session is fully established
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Route based on onboarding status
    if (user && !user.onboarded) {
      console.log("AuthFlow: Redirecting to onboarding");
      navigate("/onboarding", { replace: true });
    } else {
      console.log("AuthFlow: Redirecting to dashboard");
      navigate("/dashboard", { replace: true });
    }
    
    // Set completion state after navigation
    setAuthFlowState(AuthFlowState.COMPLETE, {
      userId: user?.id,
      timestamp: Date.now(),
      destination: user && !user.onboarded ? "/onboarding" : "/dashboard"
    });
  } catch (error) {
    console.error("Navigation error:", error);
    setAuthFlowState(AuthFlowState.ERROR, { error: String(error) });
    
    // Emergency fallback - direct URL change
    if (user && !user.onboarded) {
      window.location.href = "/onboarding";
    } else {
      window.location.href = "/dashboard";
    }
  }
};

/**
 * Log authentication-related error for debugging
 */
export const logAuthError = (source: string, error: any): void => {
  console.error(`Auth Error [${source}]:`, error);
  setAuthFlowState(AuthFlowState.ERROR, { 
    source,
    error: String(error),
    timestamp: Date.now() 
  });
};

/**
 * Simplified login function that integrates with the flow service
 */
export const loginUser = async (
  email: string, 
  password: string,
  navigate: NavigateFunction
): Promise<boolean> => {
  console.log("Starting login flow for:", email);
  setAuthFlowState(AuthFlowState.AUTHENTICATING, { email });
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (error) {
      logAuthError("login", error);
      toast.error("Login failed", { description: error.message });
      return false;
    }
    
    if (!data?.user) {
      logAuthError("login", "No user data returned");
      toast.error("Login failed", { description: "No user data returned" });
      return false;
    }
    
    console.log("Login successful:", data.user.id);
    
    // Immediately mark login as successful
    localStorage.setItem('login_success_timestamp', Date.now().toString());
    
    // Get user profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
      
    // Create user object with profile data
    const user = {
      ...profileData,
      id: data.user.id,
      email: data.user.email,
      onboarded: profileData?.onboarded ?? false
    };
    
    // Handle navigation
    await handleSuccessfulLogin(navigate, user);
    return true;
  } catch (error) {
    logAuthError("login", error);
    toast.error("Login failed", { description: String(error) });
    return false;
  }
};
