import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User, EQArchetype, CoachingMode, SubscriptionTier } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{error?: Error} | undefined>;
  signup: (email: string, password: string) => Promise<{error?: Error} | undefined>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  setArchetype: (archetype: EQArchetype) => void;
  setCoachingMode: (mode: CoachingMode) => void;
  setOnboarded: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state
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

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        return { error };
      }
      
      toast.success("Logged in successfully");
      // Redirect will happen via the auth state change listener
      return data;
    } catch (error) {
      console.error("Login error:", error);
      return { error: error instanceof Error ? error : new Error("Failed to login") };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        return { error };
      }
      
      toast.success("Account created successfully");
      // Redirect will happen via the auth state change listener
      return data;
    } catch (error) {
      console.error("Signup error:", error);
      return { error: error instanceof Error ? error : new Error("Failed to create account") };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setUser({ ...user, ...updates });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const setArchetype = (archetype: EQArchetype) => {
    if (!user) return;
    updateProfile({ eq_archetype: archetype });
  };

  const setCoachingMode = (mode: CoachingMode) => {
    if (!user) return;
    updateProfile({ coaching_mode: mode });
  };

  const setOnboarded = (value: boolean) => {
    if (!user) return;
    updateProfile({ onboarded: value });
  };

  // Redirect based on auth state and onboarding status
  useEffect(() => {
    if (!isLoading && user) {
      if (!user.onboarded) {
        navigate("/onboarding");
      } else if (window.location.pathname === "/login" || window.location.pathname === "/signup") {
        navigate("/chat");
      }
    }
  }, [user, isLoading, navigate]);

  return (
    <AuthContext.Provider 
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateProfile,
        setArchetype,
        setCoachingMode,
        setOnboarded
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
