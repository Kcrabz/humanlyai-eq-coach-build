
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { updateUserProfileInDatabase } from "@/services/authService";

export const useAuthCore = (setUser: React.Dispatch<React.SetStateAction<User | null>>) => {
  /**
   * Handles user login with email and password
   */
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

  /**
   * Handles user logout
   */
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

  /**
   * Updates a user's profile
   */
  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    console.log("Profile update attempt started");
    
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        console.error("Profile update error: No authenticated user");
        toast.error("Failed to update profile", { description: "Not authenticated" });
        return false;
      }

      const success = await updateUserProfileInDatabase(authUser.id, updates);
      
      if (success) {
        // Update local state
        setUser((prevUser) => prevUser ? { ...prevUser, ...updates } : null);
        toast.success("Profile updated successfully");
      }
      
      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      console.error("Unexpected profile update error:", errorMessage);
      toast.error("Failed to update profile", { description: errorMessage });
      return false;
    }
  };

  return {
    login,
    logout,
    updateProfile
  };
};
