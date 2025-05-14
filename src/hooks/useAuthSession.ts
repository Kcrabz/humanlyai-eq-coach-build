
import { useState, useEffect, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { markLoginSuccess, isRunningAsPWA } from '@/utils/loginRedirectUtils';
import { AuthNavigationService, NavigationState } from '@/services/authNavigationService';

/**
 * Optimized hook for managing authentication session state
 */
export const useAuthSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authEvent, setAuthEvent] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [loginTimestamp, setLoginTimestamp] = useState<number | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [authInitComplete, setAuthInitComplete] = useState(false);

  // Fast session restoration from localStorage before network requests
  useEffect(() => {
    try {
      // Try to restore session from localStorage immediately for instant UI update
      const storedSession = localStorage.getItem('sb-acboajrjgqqnfrtozssb-auth-token');
      if (storedSession) {
        try {
          console.log("Found stored session token, attempting to restore");
          const parsedSession = JSON.parse(storedSession);
          if (parsedSession?.currentSession) {
            console.log("Fast session restoration from localStorage");
            setSession(parsedSession.currentSession);
            setAuthEvent('FAST_RESTORED_SESSION');
            setSessionReady(true);
            
            // Don't exit loading state too quickly - we need to ensure profile data is loaded
            setTimeout(() => {
              if (!profileLoaded) {
                console.log("Setting profile as loaded after fast session restore");
                setProfileLoaded(true);
                setIsLoading(false);
              }
            }, 300); // Increased from 200ms for more reliability
          }
        } catch (e) {
          console.warn("Could not parse stored session", e);
        }
      } else {
        // No session found - exit loading quickly
        setTimeout(() => {
          if (isLoading) {
            console.log("No stored session found, exiting loading state");
            setIsLoading(false);
          }
        }, 100);
      }
    } catch (e) {
      console.warn("Error accessing localStorage", e);
    }
  }, [profileLoaded, isLoading]);

  // Optimized session update handler
  const updateSessionAfterEvent = useCallback((event: string) => {
    console.log("Auth event:", event);
    
    if (event === 'SIGNED_IN') {
      // Set login timestamp immediately
      const timestamp = Date.now();
      setLoginTimestamp(timestamp);
      markLoginSuccess();
      
      // Signal authentication to navigation system
      AuthNavigationService.setState(NavigationState.AUTHENTICATED, {
        timestamp,
        authEvent: event
      });
      
      // Update session without waiting for getSession
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          console.log("User signed in:", data.user.id);
          setAuthEvent('SIGN_IN_COMPLETE');
          
          // Delaying these state updates to ensure they happen after session is fully established
          setTimeout(() => {
            setProfileLoaded(true);
            setSessionReady(true);
            setIsLoading(false); // Exit loading state on sign in
          }, 100); // Increased from 50ms for more reliability
          
          // Handle PWA mode
          if (isRunningAsPWA()) {
            localStorage.setItem('pwa_auth_timestamp', timestamp.toString());
            localStorage.setItem('pwa_redirect_after_login', '/dashboard');
          }
        }
      }).catch(error => {
        console.error("Error getting user after sign in:", error);
        setIsLoading(false); // Exit loading state even on error
      });
    } else if (event === 'SIGNED_OUT') {
      setSession(null);
      setAuthEvent('SIGN_OUT_COMPLETE');
      setProfileLoaded(false);
      setSessionReady(false);
      setIsLoading(false); // Exit loading state immediately on sign out
      
      // Clear auth states
      AuthNavigationService.resetAllNavigationState();
      localStorage.removeItem('login_success_timestamp');
      localStorage.removeItem('pwa_auth_timestamp');
      localStorage.removeItem('pwa_redirect_after_login');
      sessionStorage.removeItem('pwa_desired_path');
      sessionStorage.removeItem('auth_navigation_handling_login');
      
      // Clean cached profiles on logout
      localStorage.removeItem('cached_user_profile');
    }
  }, []);

  // Core authentication initialization - optimized for performance
  useEffect(() => {
    let isMounted = true;
    console.log("Setting up auth state listener");
    
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!isMounted) return;
        
        console.log("Auth state change event:", event);
        
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

    // Check existing session with minimal delay
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (!isMounted) return;
      
      console.log("Retrieved session from Supabase:", existingSession ? "Yes" : "No");
      setSession(existingSession);
      
      if (existingSession) {
        setAuthEvent('RESTORED_SESSION');
        setProfileLoaded(true);
        setSessionReady(true);
        
        // Update navigation state
        AuthNavigationService.setState(NavigationState.AUTHENTICATED, {
          restored: true,
          timestamp: Date.now()
        });
        
        // PWA handling
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
      setAuthInitComplete(true);
    }).catch(error => {
      console.error("Error getting session:", error);
      if (isMounted) {
        setIsLoading(false);
        setInitialized(true);
        setAuthInitComplete(true);
      }
    });

    // Safety timeout - increased to 300ms max wait
    const safetyTimeout = setTimeout(() => {
      if (isMounted && isLoading) {
        console.log("Safety timeout triggered - forcing auth state to complete loading");
        setIsLoading(false);
        setInitialized(true);
        setAuthInitComplete(true);
      }
    }, 500); // Increased timeout for more reliability

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, [updateSessionAfterEvent, isLoading]);

  return { 
    session, 
    isLoading, 
    setIsLoading, 
    authEvent, 
    profileLoaded, 
    setProfileLoaded,
    initialized,
    loginTimestamp,
    sessionReady,
    authInitComplete
  };
};
