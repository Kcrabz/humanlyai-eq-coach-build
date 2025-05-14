
import { useState, useEffect, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { markLoginSuccess, forceRedirectToDashboard, isRunningAsPWA } from '@/utils/loginRedirectUtils';

/**
 * Optimized hook for managing authentication session state with improved performance
 */
export const useAuthSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authEvent, setAuthEvent] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [loginTimestamp, setLoginTimestamp] = useState<number | null>(null);

  // Fast session restoration from localStorage before network requests
  useEffect(() => {
    try {
      // Try to restore session from localStorage immediately 
      // This provides an instant UI update without waiting for network
      const storedSession = localStorage.getItem('sb-auth-token');
      if (storedSession) {
        try {
          const parsedSession = JSON.parse(storedSession);
          if (parsedSession?.currentSession) {
            console.log("Fast session restoration from localStorage");
            setSession(parsedSession.currentSession);
            setAuthEvent('FAST_RESTORED_SESSION');
          }
        } catch (e) {
          console.warn("Could not parse stored session", e);
        }
      }
    } catch (e) {
      console.warn("Error accessing localStorage", e);
    }
  }, []);

  // Optimized session update handler
  const updateSessionAfterEvent = useCallback(async (event: string) => {
    if (event === 'SIGNED_IN') {
      try {
        // Avoid redundant fetch - set immediately from event data
        const timestamp = Date.now();
        setLoginTimestamp(timestamp);
        
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setAuthEvent('SIGN_IN_COMPLETE');
        setProfileLoaded(false);
        markLoginSuccess();
        
        // Handle PWA mode more efficiently
        if (isRunningAsPWA()) {
          localStorage.setItem('pwa_auth_timestamp', Date.now().toString());
          localStorage.setItem('pwa_redirect_after_login', '/dashboard');
        }
      } catch (error) {
        console.error("Error updating session after sign in:", error);
      }
    } else if (event === 'SIGNED_OUT') {
      setSession(null);
      setAuthEvent('SIGN_OUT_COMPLETE');
      setProfileLoaded(false);
      localStorage.removeItem('login_success_timestamp');
      localStorage.removeItem('pwa_auth_timestamp');
      localStorage.removeItem('pwa_redirect_after_login');
      sessionStorage.removeItem('pwa_desired_path');
    }
  }, []);

  // Core authentication initialization with improved performance
  useEffect(() => {
    let isMounted = true;
    let hasInitialized = false;
    
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;
        
        // Immediate updates for critical events
        if (event !== 'INITIAL_SESSION') {
          setSession(newSession);
        }
        setAuthEvent(event);
        
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          updateSessionAfterEvent(event);
        }
      }
    );

    // Check existing session with minimal delay - now with no delay for faster load
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (!isMounted) return;
      
      setSession(existingSession);
      
      if (existingSession) {
        setAuthEvent('RESTORED_SESSION');
        setProfileLoaded(true);
        
        // Streamlined PWA handling
        if (isRunningAsPWA() && !localStorage.getItem('pwa_session_restored')) {
          localStorage.setItem('pwa_session_restored', 'true');
          const desiredPath = sessionStorage.getItem('pwa_desired_path');
          if (desiredPath && (window.location.pathname === '/' || window.location.pathname === '/login')) {
            window.location.href = desiredPath;
          }
        }
      }
      
      setIsLoading(false);
      setInitialized(true);
      hasInitialized = true;
    }).catch(error => {
      console.error("Error getting session:", error);
      if (isMounted) {
        setIsLoading(false);
        setInitialized(true);
        hasInitialized = true;
      }
    });

    // Safety timeout to prevent indefinite loading - reduced to 1 second
    const safetyTimeout = setTimeout(() => {
      if (!hasInitialized && isMounted) {
        setIsLoading(false);
        setInitialized(true);
        console.log("Auth initialization safety timeout triggered");
      }
    }, 1000); // Reduced timeout for faster recovery

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
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
