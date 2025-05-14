
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
  const [pwaMode] = useState<boolean>(typeof window !== 'undefined' ? window.isPwaMode() : false);

  // Fast session restoration from localStorage before network requests
  useEffect(() => {
    try {
      // Try to restore session from localStorage immediately for instant UI update
      const storedSession = localStorage.getItem('sb-acboajrjgqqnfrtozssb-auth-token');
      if (storedSession) {
        try {
          console.log(`Found stored session token, attempting to restore ${pwaMode ? "(PWA mode)" : ""}`);
          const parsedSession = JSON.parse(storedSession);
          if (parsedSession?.currentSession) {
            console.log(`Fast session restoration from localStorage ${pwaMode ? "(PWA mode)" : ""}`);
            setSession(parsedSession.currentSession);
            setAuthEvent('FAST_RESTORED_SESSION');
            setSessionReady(true);
            
            // Use longer timeout for PWA mode
            const timeoutMs = pwaMode ? 500 : 300;
            
            // Don't exit loading state too quickly - we need to ensure profile data is loaded
            setTimeout(() => {
              if (!profileLoaded) {
                console.log(`Setting profile as loaded after fast session restore ${pwaMode ? "(PWA mode)" : ""}`);
                setProfileLoaded(true);
                setIsLoading(false);
              }
            }, timeoutMs); 
          }
        } catch (e) {
          console.warn("Could not parse stored session", e);
        }
      } else {
        // No session found - exit loading quickly
        setTimeout(() => {
          if (isLoading) {
            console.log(`No stored session found, exiting loading state ${pwaMode ? "(PWA mode)" : ""}`);
            setIsLoading(false);
          }
        }, pwaMode ? 200 : 100);
      }
    } catch (e) {
      console.warn("Error accessing localStorage", e);
    }
  }, [profileLoaded, isLoading, pwaMode]);

  // Optimized session update handler
  const updateSessionAfterEvent = useCallback((event: string) => {
    console.log(`Auth event: ${event} ${pwaMode ? "(PWA mode)" : ""}`);
    
    if (event === 'SIGNED_IN') {
      // Set login timestamp immediately
      const timestamp = Date.now();
      setLoginTimestamp(timestamp);
      markLoginSuccess();
      
      // Signal authentication to navigation system
      AuthNavigationService.setState(NavigationState.AUTHENTICATED, {
        timestamp,
        authEvent: event,
        isPwa: pwaMode
      });
      
      // Update session without waiting for getSession
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          console.log(`User signed in: ${data.user.id} ${pwaMode ? "(PWA mode)" : ""}`);
          setAuthEvent('SIGN_IN_COMPLETE');
          
          // For PWA mode, use a longer delay to ensure complete session restoration
          const delayMs = pwaMode ? 300 : 100;
          
          // Delaying these state updates to ensure they happen after session is fully established
          setTimeout(() => {
            setProfileLoaded(true);
            setSessionReady(true);
            setIsLoading(false); // Exit loading state on sign in
          }, delayMs);
          
          // Handle PWA mode
          if (pwaMode) {
            localStorage.setItem('pwa_auth_timestamp', timestamp.toString());
            
            // Special handling for just-logged-in state in PWA
            sessionStorage.setItem('just_logged_in', 'true');
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
      sessionStorage.removeItem('pwa_desired_path');
      sessionStorage.removeItem('auth_navigation_handling_login');
      
      // Also clear PWA-specific flags
      localStorage.removeItem('is_pwa_mode');
      sessionStorage.removeItem('just_logged_in');
      
      // Clean cached profiles on logout
      localStorage.removeItem('cached_user_profile');
    }
  }, [pwaMode]);

  // Core authentication initialization - optimized for performance
  useEffect(() => {
    let isMounted = true;
    console.log(`Setting up auth state listener ${pwaMode ? "(PWA mode)" : ""}`);
    
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!isMounted) return;
        
        console.log(`Auth state change event: ${event} ${pwaMode ? "(PWA mode)" : ""}`);
        
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

    // Use longer timeouts for PWA mode
    const sessionTimeoutMs = pwaMode ? 1000 : 500;

    // Check existing session with minimal delay
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (!isMounted) return;
      
      console.log(`Retrieved session from Supabase: ${existingSession ? "Yes" : "No"} ${pwaMode ? "(PWA mode)" : ""}`);
      setSession(existingSession);
      
      if (existingSession) {
        setAuthEvent('RESTORED_SESSION');
        setProfileLoaded(true);
        setSessionReady(true);
        
        // Update navigation state
        AuthNavigationService.setState(NavigationState.AUTHENTICATED, {
          restored: true,
          timestamp: Date.now(),
          isPwa: pwaMode
        });
        
        // PWA handling - enhanced for mobile devices
        if (pwaMode) {
          const desiredPath = sessionStorage.getItem('pwa_desired_path');
          console.log(`PWA session restored, desired path: ${desiredPath || 'none'}`);
          
          if (desiredPath) {
            console.log(`PWA: Setting stored path flag for: ${desiredPath}`);
            // Let AuthenticationGuard handle the actual navigation
            localStorage.setItem('pwa_has_pending_navigation', 'true');
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

    // Safety timeout - increased for PWA mode
    const safetyTimeoutMs = pwaMode ? 1000 : 500;
    const safetyTimeout = setTimeout(() => {
      if (isMounted && isLoading) {
        console.log(`Safety timeout triggered - forcing auth state to complete loading ${pwaMode ? "(PWA mode)" : ""}`);
        setIsLoading(false);
        setInitialized(true);
        setAuthInitComplete(true);
      }
    }, safetyTimeoutMs);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, [updateSessionAfterEvent, isLoading, pwaMode]);

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
