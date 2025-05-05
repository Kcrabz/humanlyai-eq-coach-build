
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

export const useAuthSignup = (setUser: React.Dispatch<React.SetStateAction<User | null>>) => {
  /**
   * Handles user signup with email and password
   */
  const signup = async (email: string, password: string): Promise<boolean> => {
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
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              onboarded: false,
              subscription_tier: 'free'
            });
          
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
      
      // With Supabase, signUp doesn't automatically log in the user in all cases
      // Let's explicitly sign in after signup to ensure session consistency
      if (data.session === null) {
        console.log("No session after signup. Explicitly signing in the user...");
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (signInError) {
          console.error("Auto sign-in error after signup:", signInError.message);
          toast.error("Account created, but automatic login failed", { 
            description: "Please try logging in manually with your credentials." 
          });
          return false;
        }
        
        console.log("Explicit sign-in successful after signup");
        
        // Update user state with session data
        if (signInData.user) {
          setUser({
            id: signInData.user.id,
            email: signInData.user.email!,
            onboarded: false,
            subscription_tier: 'free'
          });
          
          toast.success("Account created and logged in successfully");
          return true;
        }
      } else {
        // We have a session directly from signup
        console.log("User automatically signed in after signup");
        
        setUser({
          id: data.user.id,
          email: data.user.email!,
          onboarded: false,
          subscription_tier: 'free'
        });
        
        toast.success("Account created successfully");
        return true;
      }
      
      return true;
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
