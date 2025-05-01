
import { useState, useEffect } from 'react';
import { User } from '@/types';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsLoading(true);
        
        if (session) {
          setSession(session);
          
          // Get the user profile from Supabase
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profile) {
            // Convert Supabase profile to our User type
            const userProfile: User = {
              id: session.user.id,
              email: session.user.email!,
              name: profile.name || undefined,
              avatar_url: profile.avatar_url || undefined,
              eq_archetype: profile.eq_archetype || undefined,
              coaching_mode: profile.coaching_mode || undefined,
              subscription_tier: profile.subscription_tier || 'free',
              onboarded: profile.onboarded || false
            };
            
            setUser(userProfile);
          } else {
            // Basic user info if profile not found
            setUser({
              id: session.user.id,
              email: session.user.email!,
              subscription_tier: 'free',
              onboarded: false
            });
          }
        } else {
          setUser(null);
          setSession(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        
        // Get the user profile
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              // Convert Supabase profile to our User type
              const userProfile: User = {
                id: session.user.id,
                email: session.user.email!,
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
                id: session.user.id,
                email: session.user.email!,
                subscription_tier: 'free',
                onboarded: false
              });
            }
            
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, session, isLoading, setUser };
};
