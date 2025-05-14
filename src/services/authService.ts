import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { toast } from "sonner";

/**
 * Core authentication service that centralizes all auth-related operations
 * and provides a consistent interface for the rest of the application
 */

// Authentication state tracking
const AUTH_STATE_KEY = 'auth_session_state';

/**
 * Authentication states to track user journey
 */
export enum AuthState {
  SIGNED_OUT = 'signed_out',
  SIGNING_IN = 'signing_in',
  SIGNED_IN = 'signed_in',
  SIGNING_UP = 'signing_up',
  SIGNED_UP = 'signed_up',
  NEEDS_ONBOARDING = 'needs_onboarding',
  ONBOARDED = 'onboarded',
}

/**
 * Set the current authentication state
 */
export const setAuthState = (state: AuthState, additionalData?: Record<string, any>): void => {
  try {
    const data = {
      state,
      timestamp: Date.now(),
      ...(additionalData || {})
    };
    sessionStorage.setItem(AUTH_STATE_KEY, JSON.stringify(data));
    console.log(`Auth state set to: ${state}`, data);
  } catch (e) {
    console.error("Failed to set auth state", e);
  }
};

/**
 * Get the current authentication state
 */
export const getAuthState = (): { state: AuthState, timestamp: number, [key: string]: any } | null => {
  try {
    const data = sessionStorage.getItem(AUTH_STATE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to get auth state", e);
  }
  return null;
};

/**
 * Clear the current authentication state
 */
export const clearAuthState = (): void => {
  try {
    sessionStorage.removeItem(AUTH_STATE_KEY);
  } catch (e) {
    console.error("Failed to clear auth state", e);
  }
};

/**
 * Determine if a user has just completed authentication
 */
export const hasJustAuthenticated = (): boolean => {
  const state = getAuthState();
  if (!state) return false;
  
  // Check if signed in within the last 30 seconds
  const recentlySignedIn = 
    (state.state === AuthState.SIGNED_IN || 
     state.state === AuthState.SIGNED_UP) && 
    (Date.now() - state.timestamp < 30000);
  
  return recentlySignedIn;
};

/**
 * Get user profile from database
 */
export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    // First get the profile data
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
    
    // Get the current session to access the user email
    const { data: sessionData } = await supabase.auth.getSession();
    const email = sessionData?.session?.user?.email || '';
    
    if (!email) {
      console.error("Could not retrieve user email from session");
    }
    
    // Combine the profile data with the email from the session
    const user: User = {
      ...profileData,
      email,
      subscription_tier: profileData.subscription_tier || 'free'
    };
    
    return user;
  } catch (e) {
    console.error("Exception fetching user profile:", e);
    return null;
  }
};

/**
 * Update user profile in database
 */
export const updateUserProfileInDatabase = async (
  userId: string, 
  updates: Partial<User>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    
    if (error) {
      console.error("Error updating user profile:", error);
      toast.error("Failed to update profile", { description: error.message });
      return false;
    }
    
    return true;
  } catch (e) {
    console.error("Exception updating user profile:", e);
    toast.error("Failed to update profile", { description: (e as Error).message });
    return false;
  }
};

/**
 * Navigate user based on authentication status
 */
export const navigateBasedOnAuthState = (
  user: User | null, 
  navigate: (path: string, options?: any) => void,
  currentPath: string
): void => {
  if (!user) {
    // Not authenticated - send to login
    if (!isPublicPath(currentPath)) {
      console.log(`Not authenticated, redirecting from ${currentPath} to /login`);
      navigate('/login', { replace: true });
    }
    return;
  }
  
  // User is authenticated
  if (isAuthPath(currentPath)) {
    // Redirect from auth pages to dashboard
    console.log(`Authenticated user on auth page, redirecting to dashboard`);
    navigate('/dashboard', { replace: true });
    return;
  }

  // Check onboarding status
  if (user.onboarded === false && !isOnboardingPath(currentPath)) {
    console.log(`User not onboarded, redirecting to onboarding`);
    navigate('/onboarding', { replace: true });
    return;
  }
  
  // Onboarded user on onboarding page - redirect to dashboard
  if (user.onboarded === true && isOnboardingPath(currentPath)) {
    // Only redirect if not explicitly retaking assessment
    if (!hasRetakingParameter(window.location.search)) {
      console.log(`Onboarded user on onboarding page, redirecting to dashboard`);
      navigate('/dashboard', { replace: true });
    }
  }
};

/**
 * Utility functions for path checking
 */
export const isAuthPath = (path: string): boolean => {
  return path === '/login' || 
         path === '/signup' || 
         path === '/reset-password' || 
         path === '/update-password';
};

export const isPublicPath = (path: string): boolean => {
  return path === '/' || 
         path === '/pricing' || 
         path === '/about' || 
         isAuthPath(path);
};

export const isOnboardingPath = (path: string): boolean => {
  return path === '/onboarding';
};

export const hasRetakingParameter = (search: string): boolean => {
  const params = new URLSearchParams(search);
  return params.get('step') === 'archetype';
};

export const getSourceParameter = (search: string): string | null => {
  const params = new URLSearchParams(search);
  return params.get('source');
};
