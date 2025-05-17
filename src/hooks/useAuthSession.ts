
import { useState, useEffect, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { markLoginSuccess, forceRedirectToDashboard, isRunningAsPWA } from '@/utils/loginRedirectUtils';
import { 
  LOGIN_SUCCESS_TIMESTAMP, 
  PWA_AUTH_TIMESTAMP,
  PWA_REDIRECT_AFTER_LOGIN,
  PWA_SESSION_RESTORED,
  PWA_DESIRED_PATH
} from '@/constants/storageKeys';

/**
 * Hook for managing authentication session state with improved initialization and sign-in handling
 */
export const useAuthSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authEvent, setAuthEvent] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [loginTimestamp, setLoginTimestamp] = useState<number | null>(null);

  // Handle session updates after authentication events
  const updateSessionAfterEvent = useCallback(async (event: string) => {
    if (event === 'SIGNED_IN') {
      console.log("User signed in, updating session and state immediately");
      try {
        // Record the login timestamp
        const timestamp = Date.now();
        setLoginTimestamp(timestamp);
        
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setAuthEvent('SIGN_IN_COMPLETE');
        
        // Mark that we need to wait for profile to load
        setProfileLoaded(false);
        
        // Mark login success to trigger fresh chat experience
        markLoginSuccess();
        
        // Check if this is a PWA and handle redirects more aggressively
        const isPWA = isRunningAsPWA();
        console.log("Login success marked for fresh chat experience", { isPWA });
        
        // For PWA environments, we need more aggressive handling
        if (isPWA) {
          // Give a little time for state to update before redirect
          setTimeout(() => {
            if (data.session?.user.id) {
              // Store current timestamp in localStorage to help with PWA redirects
              localStorage.setItem('pwa_auth_timestamp', Date.now().toString());
              console.log("PWA login successful, setting redirect flag");
              
              // Set a delayed redirect to dashboard for PWA mode
              // This is picked up by the service worker registration handler
              localStorage.setItem('pwa_redirect_after_login', '/dashboard');
            }
          }, 300);
        }
      } catch (error) {
        console.error("Error updating session after sign in:", error);
      }
    } else if (event === 'SIGNED_OUT') {
      console.log("User signed out, clearing session");
      setSession(null);
      setAuthEvent('SIGN_OUT_COMPLETE');
      setProfileLoaded(false);
      localStorage.removeItem('login_success_timestamp');
      // Also clear PWA-specific values
      localStorage.removeItem('pwa_auth_timestamp');
      localStorage.removeItem('pwa_redirect_after_login');
      sessionStorage.removeItem('pwa_desired_path');
    }
  }, []);

  // Check for login success via localStorage as a fallback
  useEffect(() => {
    const storedTimestamp = localStorage.getItem(LOGIN_SUCCESS_TIMESTAMP);
    if (storedTimestamp && !loginTimestamp) {
      const timestamp = parseInt(storedTimestamp);
      // Only use stored timestamp if it's recent (last 5 minutes)
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        setLoginTimestamp(timestamp);
        console.log("Restored login success state from localStorage", { timestamp });
      } else {
        // Clear expired login timestamp
        localStorage.removeItem(LOGIN_SUCCESS_TIMESTAMP);
      }
    }
    
    // Check for PWA auth timestamp as additional fallback
    const pwaAuthTimestamp = localStorage.getItem(PWA_AUTH_TIMESTAMP);
    if (pwaAuthTimestamp && isRunningAsPWA()) {
      const timestamp = parseInt(pwaAuthTimestamp);
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        console.log("Found recent PWA auth timestamp - may need to redirect", { timestamp });
      }
    }
  }, [loginTimestamp]);

  useEffect(() => {
    console.log("Setting up auth session listener");
    
    let isMounted = true;
    
    // Set up the auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.id);
        
        if (isMounted) {
          // Update the session state
          if (event !== 'INITIAL_SESSION') {
            setSession(newSession);
          }
          setAuthEvent(event);
          
          // For critical events, force an immediate session check and state update
          if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
            updateSessionAfterEvent(event);
          }
        }
      }
    );

    // THEN check for an existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      console.log("Existing session check:", existingSession?.user?.id);
      if (isMounted) {
        setSession(existingSession);
        
        // If we have an existing session, set a "RESTORED_SESSION" event
        if (existingSession) {
          setAuthEvent('RESTORED_SESSION');
          setProfileLoaded(true); // Assume profile is loaded for existing sessions
          
          // For PWA mode, check if we need to handle redirects
          if (isRunningAsPWA() && !localStorage.getItem(PWA_SESSION_RESTORED)) {
            console.log("PWA session restored, may need to handle redirects");
            localStorage.setItem(PWA_SESSION_RESTORED, 'true');
            
            // Check for stored redirect path
            const desiredPath = sessionStorage.getItem(PWA_DESIRED_PATH);
            if (desiredPath && window.location.pathname === '/' || window.location.pathname === '/login') {
              console.log("Found stored redirect path for PWA:", desiredPath);
              // Add slight delay to allow context to initialize
              setTimeout(() => {
                window.location.href = desiredPath;
              }, 300);
            }
          }
        }
        
        // Make sure to set isLoading to false once session is checked
        setIsLoading(false);
        setInitialized(true);
      }
    }).catch(error => {
      console.error("Error getting session:", error);
      if (isMounted) {
        setIsLoading(false);
        setInitialized(true);
      }
    });

    return () => {
      console.log("Cleaning up auth session listener");
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [updateSessionAfterEvent]);

  return { 
    session, 
    isLoading, 
    setIsLoading, 
    authEvent, 
    profileLoaded, 
    setProfileLoaded,
    initialized,
    loginTimestamp
  };
};
