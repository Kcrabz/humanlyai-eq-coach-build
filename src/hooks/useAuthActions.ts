
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

export const useAuthActions = (setUser: React.Dispatch<React.SetStateAction<User | null>>) => {
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        return { error };
      }
      
      toast.success("Logged in successfully");
      return data;
    } catch (error) {
      console.error("Login error:", error);
      return { error: error instanceof Error ? error : new Error("Failed to login") };
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        return { error };
      }
      
      toast.success("Account created successfully");
      return data;
    } catch (error) {
      console.error("Signup error:", error);
      return { error: error instanceof Error ? error : new Error("Failed to create account") };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!setUser) return;

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', authUser.id);
      
      if (error) throw error;
      
      // Update local state
      setUser((prevUser) => prevUser ? { ...prevUser, ...updates } : null);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  return {
    login,
    signup,
    logout,
    updateProfile
  };
};
