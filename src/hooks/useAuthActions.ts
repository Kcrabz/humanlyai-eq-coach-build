
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthState } from "@/hooks/useAuthState";
import { logSecurityEvent } from "@/services/securityLoggingService";

export const useAuthActions = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user } = useAuthState();
  
  // Get navigate function safely with a try/catch to prevent errors
  let navigate: ((path: string, options?: any) => void) | undefined;
  try {
    navigate = useNavigate();
  } catch (error) {
    console.warn("Router not available, navigation will be disabled");
    // Provide a no-op function if navigate is unavailable
    navigate = undefined;
  }

  const logout = async () => {
    try {
      setIsLoggingOut(true);
      
      // For non-premium users, clear session-specific chat history
      if (user && user.subscription_tier !== 'premium') {
        // Clear session storage
        const sessionId = sessionStorage.getItem(`chat_session_${user.id}`);
        if (sessionId) {
          localStorage.removeItem(`chat_messages_${user.id}_${sessionId}`);
          sessionStorage.removeItem(`chat_session_${user.id}`);
          console.log("Cleared session-specific chat history for free/basic user");
        }
      }
      
      // Log logout event before actually logging out
      if (user?.id) {
        await logSecurityEvent({
          userId: user.id,
          eventType: 'logout'
        });
      }
      
      // Perform the actual logout
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      console.log("Successfully logged out");
      
      // Navigate to the home page if navigation is available
      if (navigate) {
        navigate("/");
      } else {
        // Fallback for when navigate is not available
        window.location.href = "/";
      }
      
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Failed to log out");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return {
    logout,
    isLoggingOut,
  };
};

export default useAuthActions;
