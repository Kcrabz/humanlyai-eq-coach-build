
import { useState, useEffect } from 'react';
import { User } from '@/types';
import { Session } from '@supabase/supabase-js';
import { createProfileIfNeeded, fetchUserProfile, createBasicUserProfile } from '@/services/authStateService';

/**
 * Hook for managing user profile state based on authentication
 */
export const useProfileState = (
  session: Session | null, 
  isLoading: boolean, 
  setIsLoading: (value: boolean) => void
) => {
  const [user, setUser] = useState<User | null>(null);

  // Effect for loading and setting user profile when session changes
  useEffect(() => {
    // If there's no session or we're already done loading, do nothing more
    if (!session) {
      console.log("No session available, clearing user profile");
      setUser(null);
      return;
    }

    if (!isLoading) return;

    console.log("Loading user profile for session:", session.user.id);
    
    const loadUserProfile = async () => {
      try {
        if (session.user) {
          console.log("Creating or fetching profile for:", session.user.id);
          
          // Make sure profile exists
          await createProfileIfNeeded(session.user.id);
          
          // Get the user profile
          const profile = await fetchUserProfile(session.user.id);
          
          if (profile) {
            console.log("Profile found with onboarded status:", profile.onboarded);
            setUser(profile);
          } else {
            // Basic user info if profile not found
            console.log("No profile found, setting basic user info");
            setUser(createBasicUserProfile(session.user.id, session.user.email!));
            
            // Try to create the profile again
            await createProfileIfNeeded(session.user.id);
          }
        }
      } catch (error) {
        console.error("Error setting up user profile:", error);
        // Set basic user info even if there's an error
        if (session.user) {
          setUser(createBasicUserProfile(session.user.id, session.user.email!));
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserProfile();
  }, [session, isLoading, setIsLoading]);

  // Effect to clear user when session is null
  useEffect(() => {
    if (session === null && !isLoading) {
      setUser(null);
    }
  }, [session, isLoading]);

  return { user, setUser };
};
