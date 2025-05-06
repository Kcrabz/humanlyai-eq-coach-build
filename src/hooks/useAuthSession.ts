
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

  // Handle session updates after authentication events
  const updateSessionAfterEvent = useCallback(async (event: string) => {
    if (event === 'SIGNED_IN') {
      console.log("User signed in, updating session and state immediately");
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setAuthEvent('SIGN_IN_COMPLETE');
        // Mark that we need to wait for profile to load
        setProfileLoaded(false);
      } catch (error) {
        console.error("Error updating session after sign in:", error);
      }
    } else if (event === 'SIGNED_OUT') {
      console.log("User signed out, clearing session");
      setSession(null);
      setAuthEvent('SIGN_OUT_COMPLETE');
      setProfileLoaded(false);
    }
  }, []);

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
    initialized
  };
};
