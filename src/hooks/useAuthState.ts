
import { useState, useEffect } from 'react';
import { User, EQArchetype, CoachingMode, SubscriptionTier } from '@/types';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to create a profile if it doesn't exist
  const createProfileIfNeeded = async (userId: string) => {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
        
      if (!existingProfile) {
        console.log("Profile doesn't exist for user, creating a default one");
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            subscription_tier: 'free',
            onboarded: false
          });
          
        if (error) {
          console.error("Error creating default profile:", error);
          // Only show error if it's not a duplicate insert (which can happen during race conditions)
          if (!error.message.includes('duplicate key')) {
            toast.error("Failed to create your profile");
          }
          return false;
        }
        
        console.log("Default profile created successfully");
        return true;
      }
      
      return true;
    } catch (error) {
      console.error("Error in createProfileIfNeeded:", error);
      return false;
    }
  };

  useEffect(() => {
    console.log("Initializing auth state...");
    setIsLoading(true);
    
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.id);
        
        if (newSession) {
          setSession(newSession);
          
          if (newSession.user) {
            // Use setTimeout to prevent potential deadlocks with Supabase auth
            setTimeout(async () => {
              try {
                await createProfileIfNeeded(newSession.user.id);
                
                // Get the user profile from Supabase
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', newSession.user.id)
                  .maybeSingle();
                
                console.log("Profile fetched:", profile);
                
                if (profile) {
                  // Convert Supabase profile to our User type
                  const userProfile: User = {
                    id: newSession.user.id,
                    email: newSession.user.email!,
                    name: profile.name || undefined,
                    avatar_url: profile.avatar_url || undefined,
                    eq_archetype: profile.eq_archetype as EQArchetype || undefined,
                    coaching_mode: profile.coaching_mode as CoachingMode || undefined,
                    subscription_tier: profile.subscription_tier as SubscriptionTier || 'free',
                    onboarded: profile.onboarded || false // Ensure onboarded is correctly read
                  };
                  
                  console.log("Setting user with onboarded status:", userProfile.onboarded);
                  setUser(userProfile);
                } else {
                  // Basic user info if profile not found - explicitly set onboarded to false
                  console.log("No profile found, setting onboarded to false");
                  setUser({
                    id: newSession.user.id,
                    email: newSession.user.email!,
                    subscription_tier: 'free',
                    onboarded: false
                  });
                  
                  // Try to create the profile
                  await createProfileIfNeeded(newSession.user.id);
                }
              } catch (error) {
                console.error("Error fetching profile:", error);
                // Still set basic user info even if profile fetch fails - explicitly set onboarded to false
                console.log("Error fetching profile, setting onboarded to false");
                setUser({
                  id: newSession.user.id,
                  email: newSession.user.email!,
                  subscription_tier: 'free',
                  onboarded: false
                });
              } finally {
                setIsLoading(false);
              }
            }, 0);
          }
        } else {
          setUser(null);
          setSession(null);
          setIsLoading(false);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      console.log("Existing session check:", existingSession?.user?.id);
      
      if (existingSession) {
        setSession(existingSession);
        
        // Get the user profile - use setTimeout to prevent deadlocks
        setTimeout(async () => {
          try {
            if (existingSession.user) {
              await createProfileIfNeeded(existingSession.user.id);
            }
            
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', existingSession.user.id)
              .maybeSingle();
            
            console.log("Profile loaded from existing session:", profile);
            
            if (profile) {
              // Convert Supabase profile to our User type
              const userProfile: User = {
                id: existingSession.user.id,
                email: existingSession.user.email!,
                name: profile.name || undefined,
                avatar_url: profile.avatar_url || undefined,
                eq_archetype: profile.eq_archetype as EQArchetype || undefined,
                coaching_mode: profile.coaching_mode as CoachingMode || undefined,
                subscription_tier: profile.subscription_tier as SubscriptionTier || 'free',
                onboarded: profile.onboarded || false // Ensure onboarded is correctly read
              };
              
              console.log("Setting user with onboarded status:", userProfile.onboarded);
              setUser(userProfile);
            } else {
              // Basic user info if profile not found - explicitly set onboarded to false
              console.log("No profile found in existing session, setting onboarded to false");
              setUser({
                id: existingSession.user.id,
                email: existingSession.user.email!,
                subscription_tier: 'free',
                onboarded: false
              });
            }
          } catch (error) {
            console.error("Error fetching profile from existing session:", error);
            // Still set basic user info even if profile fetch fails - explicitly set onboarded to false
            console.log("Error fetching profile from existing session, setting onboarded to false");
            setUser({
              id: existingSession.user.id,
              email: existingSession.user.email!,
              subscription_tier: 'free',
              onboarded: false
            });
          } finally {
            setIsLoading(false);
          }
        }, 0);
      } else {
        setIsLoading(false);
      }
    }).catch(error => {
      console.error("Error getting session:", error);
      setIsLoading(false);
    });

    return () => {
      console.log("Cleaning up auth state listener");
      subscription.unsubscribe();
    };
  }, []);

  return { user, session, isLoading, setUser };
};
