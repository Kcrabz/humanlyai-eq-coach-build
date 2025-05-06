
import { useState, useEffect, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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
        
        // Store login success in localStorage as a fallback mechanism
        localStorage.setItem('login_success_timestamp', timestamp.toString());
      } catch (error) {
        console.error("Error updating session after sign in:", error);
      }
    } else if (event === 'SIGNED_OUT') {
      console.log("User signed out, clearing session");
      setSession(null);
      setAuthEvent('SIGN_OUT_COMPLETE');
      setProfileLoaded(false);
      localStorage.removeItem('login_success_timestamp');
    }
  }, []);

  // Check for login success via localStorage as a fallback
  useEffect(() => {
    const storedTimestamp = localStorage.getItem('login_success_timestamp');
    if (storedTimestamp && !loginTimestamp) {
      const timestamp = parseInt(storedTimestamp);
      // Only use stored timestamp if it's recent (last 5 minutes)
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        setLoginTimestamp(timestamp);
        console.log("Restored login success state from localStorage", { timestamp });
      } else {
        // Clear expired login timestamp
        localStorage.removeItem('login_success_timestamp');
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
