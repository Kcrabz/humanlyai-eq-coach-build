
import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for managing authentication session state
 */
export const useAuthSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("Setting up auth session listener");
    
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.id);
        setSession(newSession);
      }
    );

    // Check for an existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      console.log("Existing session check:", existingSession?.user?.id);
      setSession(existingSession);
    }).catch(error => {
      console.error("Error getting session:", error);
    }).finally(() => {
      setIsLoading(false);
    });

    return () => {
      console.log("Cleaning up auth session listener");
      subscription.unsubscribe();
    };
  }, []);

  return { session, isLoading, setIsLoading };
};
