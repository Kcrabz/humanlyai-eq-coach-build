
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

export const useAuthActions = (setUser: React.Dispatch<React.SetStateAction<User | null>>) => {
  const login = async (email: string, password: string) => {
    console.log("Login attempt started for:", email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        console.error("Login error:", error.message);
        toast.error("Login failed", { description: error.message });
        return false;
      }
      
      console.log("Login successful for:", email);
      toast.success("Logged in successfully");
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      console.error("Unexpected login error:", errorMessage);
      toast.error("Login failed", { description: errorMessage });
      return false;
    }
  };

  const signup = async (email: string, password: string) => {
    console.log("Signup attempt started for:", email);
    
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password 
      });
      
      if (error) {
        console.error("Signup error:", error.message);
        toast.error("Signup failed", { description: error.message });
        return false;
      }
      
      console.log("Signup successful for:", email);
      toast.success("Account created successfully");
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      console.error("Unexpected signup error:", errorMessage);
      toast.error("Signup failed", { description: errorMessage });
      return false;
    }
  };

  const logout = async () => {
    console.log("Logout attempt started");
    
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      console.error("Logout error:", errorMessage);
      toast.error("Failed to log out", { description: errorMessage });
      return false;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    console.log("Profile update attempt started");
    
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        console.error("Profile update error: No authenticated user");
        toast.error("Failed to update profile", { description: "Not authenticated" });
        return false;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', authUser.id);
      
      if (error) {
        console.error("Profile update error:", error.message);
        toast.error("Failed to update profile", { description: error.message });
        return false;
      }
      
      // Update local state
      setUser((prevUser) => prevUser ? { ...prevUser, ...updates } : null);
      
      console.log("Profile update successful");
      toast.success("Profile updated successfully");
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      console.error("Unexpected profile update error:", errorMessage);
      toast.error("Failed to update profile", { description: errorMessage });
      return false;
    }
  };

  return {
    login,
    signup,
    logout,
    updateProfile
  };
};
