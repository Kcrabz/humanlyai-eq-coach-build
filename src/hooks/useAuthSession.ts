
import { useState, useEffect, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { markLoginSuccess, isRunningAsPWA } from '@/utils/loginRedirectUtils';
import { AuthNavigationService, NavigationState } from '@/services/authNavigationService';

/**
 * Optimized hook for managing authentication session state
 * Enhanced for mobile and PWA compatibility
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
  const [mobileDevice] = useState<boolean>(typeof window !== 'undefined' ? 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) : 
    false
  );

  // Log critical environment information at startup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log("Auth environment detection:", {
        isPwa: pwaMode,
        isMobile: mobileDevice,
        userAgent: navigator.userAgent,
        standalone: (window.navigator as any).standalone,
        matchMedia: window.matchMedia('(display-mode: standalone)').matches,
        sessionStorage: typeof sessionStorage !== 'undefined',
        localStorage: typeof localStorage !== 'undefined'
      });
    }
  }, [pwaMode, mobileDevice]);

  // Fast session restoration from localStorage before network requests
  useEffect(() => {
    try {
      // Try to restore session from localStorage immediately for instant UI update
      const storedSession = localStorage.getItem('sb-acboajrjgqqnfrtozssb-auth-token');
      if (storedSession) {
        try {
          console.log(`Found stored session token, attempting to restore ${pwaMode ? "(PWA mode)" : mobileDevice ? "(Mobile)" : ""}`);
          const parsedSession = JSON.parse(storedSession);
          if (parsedSession?.currentSession) {
            console.log(`Fast session restoration from localStorage ${pwaMode ? "(PWA mode)" : mobileDevice ? "(Mobile)" : ""}`);
            setSession(parsedSession.currentSession);
            setAuthEvent('FAST_RESTORED_SESSION');
            setSessionReady(true);
            
            // Use longer timeout for PWA/mobile modes
            const timeoutMs = pwaMode || mobileDevice ? 1500 : 300;
            
            // Set PWA mode flag if detected
            if (pwaMode) {
              localStorage.setItem('is_pwa_mode', 'true');
            }
            
            // Don't exit loading state too quickly - we need to ensure profile data is loaded
            setTimeout(() => {
              if (!profileLoaded) {
                console.log(`Setting profile as loaded after fast session restore ${pwaMode ? "(PWA mode)" : mobileDevice ? "(Mobile)" : ""}`);
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
            console.log(`No stored session found, exiting loading state ${pwaMode ? "(PWA mode)" : mobileDevice ? "(Mobile)" : ""}`);
            setIsLoading(false);
          }
        }, pwaMode || mobileDevice ? 800 : 100);
      }
    } catch (e) {
      console.warn("Error accessing localStorage", e);
    }
  }, [profileLoaded, isLoading, pwaMode, mobileDevice]);

  // Optimized session update handler
  const updateSessionAfterEvent = useCallback((event: string) => {
    console.log(`Auth event: ${event} ${pwaMode ? "(PWA mode)" : mobileDevice ? "(Mobile)" : ""}`);
    
    if (event === 'SIGNED_IN') {
      // Set login timestamp immediately
      const timestamp = Date.now();
      setLoginTimestamp(timestamp);
      markLoginSuccess();
      
      // Signal authentication to navigation system
      AuthNavigationService.setState(NavigationState.AUTHENTICATED, {
        timestamp,
        authEvent: event,
        isPwa: pwaMode,
        isMobile: mobileDevice
      });
      
      // Update session without waiting for getSession
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          console.log(`User signed in: ${data.user.id} ${pwaMode ? "(PWA mode)" : mobileDevice ? "(Mobile)" : ""}`);
          setAuthEvent('SIGN_IN_COMPLETE');
          
          // For PWA/mobile modes, use a longer delay to ensure complete session restoration
          const delayMs = pwaMode || mobileDevice ? 1500 : 100;
          
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
            sessionStorage.setItem('pwa_login_complete', 'true');
            
            // For debugging, add a distinctive flag
            localStorage.setItem('pwa_auth_event', 'SIGNED_IN');
          }
          
          // Handle mobile device (not necessarily PWA)
          if (mobileDevice) {
            localStorage.setItem('mobile_auth_timestamp', timestamp.toString());
            sessionStorage.setItem('mobile_login_complete', 'true');
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
      localStorage.removeItem('mobile_auth_timestamp');
      sessionStorage.removeItem('pwa_desired_path');
      sessionStorage.removeItem('auth_navigation_handling_login');
      
      // Clear specific mobile/PWA flags 
      localStorage.removeItem('is_pwa_mode');
      localStorage.removeItem('pwa_auth_event');
      sessionStorage.removeItem('just_logged_in');
      sessionStorage.removeItem('pwa_login_complete');
      sessionStorage.removeItem('mobile_login_complete');
      
      // Clean cached profiles on logout
      localStorage.removeItem('cached_user_profile');
    }
  }, [pwaMode, mobileDevice]);

  // Core authentication initialization - optimized for performance
  useEffect(() => {
    let isMounted = true;
    console.log(`Setting up auth state listener ${pwaMode ? "(PWA mode)" : mobileDevice ? "(Mobile)" : ""}`);
    
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!isMounted) return;
        
        console.log(`Auth state change event: ${event} ${pwaMode ? "(PWA mode)" : mobileDevice ? "(Mobile)" : ""}`);
        
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

    // Use longer timeouts for mobile/PWA mode
    const sessionTimeoutMs = pwaMode || mobileDevice ? 2000 : 500;

    // Check existing session with minimal delay
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (!isMounted) return;
      
      console.log(`Retrieved session from Supabase: ${existingSession ? "Yes" : "No"} ${pwaMode ? "(PWA mode)" : mobileDevice ? "(Mobile)" : ""}`);
      setSession(existingSession);
      
      if (existingSession) {
        setAuthEvent('RESTORED_SESSION');
        setProfileLoaded(true);
        setSessionReady(true);
        
        // Update navigation state
        AuthNavigationService.setState(NavigationState.AUTHENTICATED, {
          restored: true,
          timestamp: Date.now(),
          isPwa: pwaMode,
          isMobile: mobileDevice
        });
        
        // PWA handling - enhanced for mobile devices
        if (pwaMode || mobileDevice) {
          const desiredPath = sessionStorage.getItem('pwa_desired_path');
          console.log(`Mobile/PWA session restored, desired path: ${desiredPath || 'none'}`);
          
          if (desiredPath) {
            console.log(`Mobile/PWA: Setting stored path flag for: ${desiredPath}`);
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

    // Safety timeout - increased for PWA/mobile mode
    const safetyTimeoutMs = pwaMode || mobileDevice ? 3000 : 500;
    const safetyTimeout = setTimeout(() => {
      if (isMounted && isLoading) {
        console.log(`Safety timeout triggered - forcing auth state to complete loading ${pwaMode ? "(PWA mode)" : mobileDevice ? "(Mobile)" : ""}`);
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
  }, [updateSessionAfterEvent, isLoading, pwaMode, mobileDevice]);

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
    authInitComplete,
    isPwaMode: pwaMode,
    isMobileDevice: mobileDevice
  };
};
