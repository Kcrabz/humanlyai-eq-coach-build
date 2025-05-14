
import { useState, useEffect } from 'react';
import { User } from '@/types';
import { Session } from '@supabase/supabase-js';
import { createProfileIfNeeded, fetchUserProfile, createBasicUserProfile } from '@/services/authStateService';

/**
 * Hook for managing user profile state based on authentication
 * Optimized to load profile data faster using caching
 */
export const useProfileState = (
  session: Session | null, 
  isLoading: boolean, 
  setIsLoading: (value: boolean) => void,
  setProfileLoaded: (value: boolean) => void
) => {
  const [user, setUser] = useState<User | null>(null);
  const [profileError, setProfileError] = useState<Error | null>(null);

  // Attempt to load cached profile immediately
  useEffect(() => {
    try {
      // Try to load cached profile for instant UI
      const cachedProfile = localStorage.getItem('cached_user_profile');
      if (cachedProfile && session) {
        try {
          const parsedProfile = JSON.parse(cachedProfile);
          if (parsedProfile?.id === session.user.id) {
            console.log("Using cached profile for immediate UI render");
            setUser(parsedProfile);
            setProfileLoaded(true);
            // Note: We'll still fetch the fresh profile from the server below
          }
        } catch (e) {
          console.warn("Could not parse cached profile", e);
        }
      }
    } catch (e) {
      console.warn("Error accessing localStorage for cached profile", e);
    }
  }, [session, setProfileLoaded]);

  // Effect for loading and setting user profile when session changes
  useEffect(() => {
    // If there's no session or we're already done loading, do nothing more
    if (!session) {
      console.log("No session available, clearing user profile");
      setUser(null);
      setProfileLoaded(false);
      return;
    }

    if (!isLoading) return;

    console.log("Loading user profile for session:", session.user.id);
    
    const loadUserProfile = async () => {
      try {
        if (session.user) {
          console.log("Creating or fetching profile for:", session.user.id);
          
          // Set basic user info immediately for faster UI updates
          const basicProfile = createBasicUserProfile(session.user.id, session.user.email!);
          setUser(basicProfile);
          
          // Make sure profile exists
          await createProfileIfNeeded(session.user.id);
          
          // Get the user profile
          const profile = await fetchUserProfile(session.user.id);
          
          if (profile) {
            console.log("Profile found with onboarded status:", profile.onboarded);
            setUser(profile);
            setProfileLoaded(true);
            
            // Cache the profile for faster loading next time
            try {
              localStorage.setItem('cached_user_profile', JSON.stringify(profile));
            } catch (e) {
              console.warn("Could not cache profile:", e);
            }
          } else {
            // Basic user info if profile not found
            console.log("No profile found, setting basic user info");
            setUser(basicProfile);
            
            // Try to create the profile again
            await createProfileIfNeeded(session.user.id);
            setProfileLoaded(true);
          }
        }
      } catch (error) {
        console.error("Error setting up user profile:", error);
        setProfileError(error as Error);
        
        // Set basic user info even if there's an error
        if (session.user) {
          setUser(createBasicUserProfile(session.user.id, session.user.email!));
          setProfileLoaded(true);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserProfile();
  }, [session, isLoading, setIsLoading, setProfileLoaded]);

  // Effect to clear user when session is null
  useEffect(() => {
    if (session === null && !isLoading) {
      setUser(null);
      setProfileLoaded(false);
      
      // Clear cached profile when logging out
      try {
        localStorage.removeItem('cached_user_profile');
      } catch (e) {
        console.warn("Could not clear cached profile:", e);
      }
    }
  }, [session, isLoading, setProfileLoaded]);

  return { user, setUser, profileError };
};
