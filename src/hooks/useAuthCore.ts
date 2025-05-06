
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { updateUserProfileInDatabase } from "@/services/authService";
import { logSecurityEvent } from "@/services/securityLoggingService";

const useAuthCore = (setUser: React.Dispatch<React.SetStateAction<User | null>>) => {
  const [error, setError] = useState<string | null>(null);

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
        setError(error.message);
        toast.error("Login failed", { description: error.message });
        
        // Log failed login attempt - using primitive types to avoid recursion
        if (data?.user?.id) {
          try {
            await logSecurityEvent({
              userId: data.user.id,
              eventType: 'login_failure',
              details: { message: error.message } // Using string instead of object reference
            });
          } catch (logError) {
            console.error("Failed to log security event:", logError);
          }
        }
        
        return false;
      }
      
      if (!data?.user) {
        console.error("Login failed: No user data returned");
        setError("No user data returned");
        toast.error("Login failed", { description: "No user data returned" });
        return false;
      }
      
      // Log successful login - using primitive types to avoid recursion
      try {
        await logSecurityEvent({
          userId: data.user.id,
          eventType: 'login_success',
          details: { time: new Date().toISOString() } // Using string primitive
        });
      } catch (logError) {
        console.error("Failed to log security event:", logError);
      }
      
      console.log("Login successful for:", email, "User data:", data.user.id);
      toast.success("Logged in successfully");
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      console.error("Unexpected login error:", errorMessage);
      setError(errorMessage);
      toast.error("Login failed", { description: errorMessage });
      return false;
    }
  };

  /**
   * Sends a password reset email
   */
  const resetPassword = async (email: string): Promise<boolean> => {
    console.log("Password reset attempt started for:", email);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      
      if (error) {
        console.error("Password reset error:", error.message);
        setError(error.message);
        toast.error("Password reset failed", { description: error.message });
        return false;
      }
      
      // Log password reset request (using generic ID since we don't know user ID)
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .maybeSingle();
          
        if (data?.id) {
          await logSecurityEvent({
            userId: data.id,
            eventType: 'password_reset_requested',
            details: { email: email, time: new Date().toISOString() } // Using string primitives
          });
        }
      } catch (logError) {
        console.error("Error logging password reset:", logError);
      }
      
      console.log("Password reset email sent successfully to:", email);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      console.error("Unexpected password reset error:", errorMessage);
      setError(errorMessage);
      toast.error("Password reset failed", { description: errorMessage });
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
        
        // Log profile update - using primitive types to avoid recursion
        try {
          await logSecurityEvent({
            userId: authUser.id,
            eventType: 'profile_updated',
            details: { 
              fields: JSON.stringify(Object.keys(updates)), // Stringify to avoid reference
              timestamp: new Date().toISOString()
            }
          });
        } catch (logError) {
          console.error("Failed to log security event:", logError);
        }
        
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
    resetPassword,
    updateProfile,
    error,
    setError
  };
};

export default useAuthCore;
