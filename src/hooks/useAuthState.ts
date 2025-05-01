
import { useState, useEffect } from 'react';
import { User, EQArchetype, CoachingMode, SubscriptionTier } from '@/types';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
                    onboarded: profile.onboarded || false
                  };
                  
                  setUser(userProfile);
                } else {
                  // Basic user info if profile not found
                  setUser({
                    id: newSession.user.id,
                    email: newSession.user.email!,
                    subscription_tier: 'free',
                    onboarded: false
                  });
                }
              } catch (error) {
                console.error("Error fetching profile:", error);
                // Still set basic user info even if profile fetch fails
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
                onboarded: profile.onboarded || false
              };
              
              setUser(userProfile);
            } else {
              // Basic user info if profile not found
              setUser({
                id: existingSession.user.id,
                email: existingSession.user.email!,
                subscription_tier: 'free',
                onboarded: false
              });
            }
          } catch (error) {
            console.error("Error fetching profile from existing session:", error);
            // Still set basic user info even if profile fetch fails
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
