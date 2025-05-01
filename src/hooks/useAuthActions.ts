
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

export const useAuthActions = (setUser: React.Dispatch<React.SetStateAction<User | null>>) => {
  const login = async (email: string, password: string) => {
    try {
      // Clear previous session to prevent conflicts
      await supabase.auth.signOut();
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        console.error("Login error:", error.message);
        return { success: false, error };
      }
      
      console.log("Login successful:", data.user?.id);
      return { success: true, data };
    } catch (error) {
      console.error("Unexpected login error:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error("Failed to login") 
      };
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password 
      });
      
      if (error) {
        console.error("Signup error:", error.message);
        return { success: false, error };
      }
      
      console.log("Signup successful:", data.user?.id);
      return { success: true, data };
    } catch (error) {
      console.error("Unexpected signup error:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error("Failed to create account") 
      };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error("Failed to log out") 
      };
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!setUser) return { success: false };

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return { success: false };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', authUser.id);
      
      if (error) throw error;
      
      // Update local state
      setUser((prevUser) => prevUser ? { ...prevUser, ...updates } : null);
      return { success: true };
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error("Failed to update profile") 
      };
    }
  };

  return {
    login,
    signup,
    logout,
    updateProfile
  };
};
