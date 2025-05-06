
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { setSecurityQuestion } from "@/services/securityQuestionService";

interface SignupData {
  email: string;
  password: string;
  securityQuestionId?: string;
  securityAnswer?: string;
}

export const useAuthSignup = (setUser: React.Dispatch<React.SetStateAction<User | null>>) => {
  /**
   * Handles user signup with email and password
   */
  const signup = async (
    email: string, 
    password: string, 
    securityQuestionId?: string, 
    securityAnswer?: string
  ): Promise<boolean> => {
    console.log("Signup attempt started for:", email);
    
    try {
      // First, attempt to create the account
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          // Ensure we're redirecting to the right place
          emailRedirectTo: window.location.origin + '/onboarding'
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
      
      // Explicitly create profile with onboarded = false
      if (data.user) {
        try {
          console.log("Creating profile for new user:", data.user.id);
          
          const profileData: any = {
            id: data.user.id,
            onboarded: false,
            subscription_tier: 'free'
          };
          
          // Add security question if provided
          if (securityQuestionId && securityAnswer) {
            await setSecurityQuestion(data.user.id, securityQuestionId, securityAnswer);
          }
          
          const { error: profileError } = await supabase
            .from('profiles')
            .insert(profileData);
          
          if (profileError) {
            console.error("Error creating profile:", profileError);
            // Continue despite profile error, we'll try to fix it later
            toast.warning("Note: Your profile will be created during onboarding");
          } else {
            console.log("Profile created successfully for user:", data.user.id);
          }
        } catch (profileCreateError) {
          console.error("Error creating profile:", profileCreateError);
          // Continue despite profile error
        }
      }
      
      // Check if email confirmation is required
      if (data.session === null) {
        // Email confirmation might be required
        toast.success("Account created! Please check your email to confirm your account", {
          duration: 6000,
        });
        
        return true;
      } else {
        // No email confirmation required, proceed with login
        console.log("No email confirmation required, proceeding with login");
        
        setUser({
          id: data.user.id,
          email: data.user.email!,
          onboarded: false,
          subscription_tier: 'free'
        });
        
        toast.success("Account created successfully");
        return true;
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      console.error("Unexpected signup error:", errorMessage);
      toast.error("Signup failed", { description: errorMessage });
      return false;
    }
  };

  return {
    signup
  };
};
