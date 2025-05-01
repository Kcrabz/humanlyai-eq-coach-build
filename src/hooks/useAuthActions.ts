
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

export const useAuthActions = (setUser: React.Dispatch<React.SetStateAction<User | null>>) => {
  const login = async (email: string, password: string): Promise<boolean> => {
    console.log("Login attempt started for:", email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      console.log("Login response:", { success: !error, userId: data?.user?.id });
      
      if (error) {
        console.error("Login error:", error.message);
        toast.error("Login failed", { description: error.message });
        return false;
      }
      
      if (!data?.user) {
        console.error("Login failed: No user data returned");
        toast.error("Login failed", { description: "No user data returned" });
        return false;
      }
      
      console.log("Login successful for:", email, "User data:", data.user.id);
      toast.success("Logged in successfully");
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      console.error("Unexpected login error:", errorMessage);
      toast.error("Login failed", { description: errorMessage });
      return false;
    }
  };

  const signup = async (email: string, password: string): Promise<boolean> => {
    console.log("Signup attempt started for:", email);
    
    try {
      // First, attempt to create the account
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          // Ensure we're redirecting to the right place
          emailRedirectTo: window.location.origin + '/chat'
        }
      });
      
      console.log("Signup response:", { success: !error, userId: data?.user?.id });
      
      if (error) {
        console.error("Signup error:", error.message);
        toast.error("Signup failed", { description: error.message });
        return false;
      }
      
      if (!data?.user) {
        console.error("Signup failed: No user data returned");
        toast.error("Signup failed", { description: "No user data returned" });
        return false;
      }

      console.log("Signup successful for:", email, "User ID:", data.user.id);
      
      // With the latest Supabase version, we're already logged in after signup
      toast.success("Account created and logged in successfully");
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      console.error("Unexpected signup error:", errorMessage);
      toast.error("Signup failed", { description: errorMessage });
      return false;
    }
  };

  const logout = async (): Promise<boolean> => {
    console.log("Logout attempt started");
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error.message);
        toast.error("Failed to log out", { description: error.message });
        return false;
      }
      
      console.log("Logout successful");
      toast.success("Logged out successfully");
      
      // Explicitly clear user state
      setUser(null);
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      console.error("Logout error:", errorMessage);
      toast.error("Failed to log out", { description: errorMessage });
      return false;
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
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
