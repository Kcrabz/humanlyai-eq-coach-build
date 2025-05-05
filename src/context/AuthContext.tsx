import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateUser: (data: any) => Promise<void>;
  getProfile: () => Promise<any>;
  setOnboarded: (value: boolean) => Promise<void>;
  setArchetype: (archetype: string) => Promise<void>;
  setCoachingMode: (mode: string) => Promise<void>;
  setSubscriptionTier: (tier: string) => Promise<void>;
  setApiKey: (key: string) => Promise<void>;
  error: string | null;
  setError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            console.error("Error fetching profile:", profileError);
            setUser(session.user);
          } else {
            // Combine auth user with profile data
            setUser({ ...session.user, ...profile });
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === 'SIGNED_IN' && session) {
          // Fetch profile data when user signs in
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            console.error("Error fetching profile on sign in:", profileError);
            setUser(session.user);
          } else {
            // Combine auth user with profile data
            setUser({ ...session.user, ...profile });
          }
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsLoading(false);
        } else if (event === 'USER_UPDATED' && session) {
          // Refresh user data when updated
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            console.error("Error fetching profile on update:", profileError);
            setUser(session.user);
          } else {
            setUser({ ...session.user, ...profile });
          }
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        setError(error.message);
        throw error;
      }

      // Fetch profile data
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching profile after sign in:", profileError);
          setUser(data.user);
        } else {
          // Combine auth user with profile data
          setUser({ ...data.user, ...profile });
        }
      }
      
      toast.success("Signed in successfully");
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error("Failed to sign in", {
        description: error.message || "Please check your credentials and try again"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error("Sign up error:", error);
        setError(error.message);
        throw error;
      }

      if (data.user) {
        // Create a profile record
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: data.user.id,
              email: data.user.email,
              onboarded: false,
              subscription_tier: 'free'
            }
          ]);
          
        if (profileError) {
          console.error("Error creating profile:", profileError);
        }
        
        // Set the user with default profile values
        setUser({ 
          ...data.user, 
          onboarded: false,
          subscription_tier: 'free'
        });
      }
      
      toast.success("Account created successfully");
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast.error("Failed to create account", {
        description: error.message || "Please try again with a different email"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      navigate("/login");
      toast.success("Signed out successfully");
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out", {
        description: error.message || "Please try again"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error("Reset password error:", error);
        setError(error.message);
        throw error;
      }
      
      toast.success("Password reset email sent", {
        description: "Check your inbox for instructions"
      });
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error("Failed to send reset email", {
        description: error.message || "Please check your email and try again"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        console.error("Update password error:", error);
        setError(error.message);
        throw error;
      }
      
      toast.success("Password updated successfully");
    } catch (error: any) {
      console.error("Update password error:", error);
      toast.error("Failed to update password", {
        description: error.message || "Please try again"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (data: any) => {
    try {
      setError(null);
      setIsLoading(true);
      
      if (!user) {
        throw new Error("No user logged in");
      }
      
      // Update profile in the database
      const { error: profileError } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
        
      if (profileError) {
        console.error("Update profile error:", profileError);
        setError(profileError.message);
        throw profileError;
      }
      
      // Update local user state
      setUser({ ...user, ...data });
      
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Update user error:", error);
      toast.error("Failed to update profile", {
        description: error.message || "Please try again"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getProfile = async () => {
    try {
      setError(null);
      
      if (!user) {
        throw new Error("No user logged in");
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error("Get profile error:", error);
        setError(error.message);
        throw error;
      }
      
      // Update local user state with fresh profile data
      setUser({ ...user, ...data });
      
      return data;
    } catch (error: any) {
      console.error("Get profile error:", error);
      throw error;
    }
  };

  const setOnboarded = async (value: boolean) => {
    try {
      await updateUser({ onboarded: value });
    } catch (error) {
      console.error("Set onboarded error:", error);
      throw error;
    }
  };

  const setArchetype = async (archetype: string) => {
    try {
      await updateUser({ eq_archetype: archetype });
    } catch (error) {
      console.error("Set archetype error:", error);
      throw error;
    }
  };

  const setCoachingMode = async (mode: string) => {
    try {
      await updateUser({ coaching_mode: mode });
    } catch (error) {
      console.error("Set coaching mode error:", error);
      throw error;
    }
  };

  const setSubscriptionTier = async (tier: string) => {
    try {
      await updateUser({ subscription_tier: tier });
    } catch (error) {
      console.error("Set subscription tier error:", error);
      throw error;
    }
  };

  const setApiKey = async (key: string) => {
    try {
      await updateUser({ openai_api_key: key });
    } catch (error) {
      console.error("Set API key error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      updateUser,
      getProfile,
      setOnboarded,
      setArchetype,
      setCoachingMode,
      setSubscriptionTier,
      setApiKey,
      error,
      setError
    }}>
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
