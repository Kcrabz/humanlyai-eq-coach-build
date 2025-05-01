
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

export const useAuthActions = (setUser: React.Dispatch<React.SetStateAction<User | null>>) => {
  const login = async (email: string, password: string) => {
    try {
      console.log("Login attempt for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error("Login error:", error);
        toast.error("Login failed", { description: error.message });
        return { error };
      }
      
      console.log("Login successful:", data.user?.id);
      toast.success("Logged in successfully");
      return { data };
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed");
      return { error: error instanceof Error ? error : new Error("Failed to login") };
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      console.log("Signup attempt for:", email);
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        console.error("Signup error:", error);
        toast.error("Signup failed", { description: error.message });
        return { error };
      }
      
      console.log("Signup successful:", data.user?.id);
      toast.success("Account created successfully");
      return { data };
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Signup failed");
      return { error: error instanceof Error ? error : new Error("Failed to create account") };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
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
