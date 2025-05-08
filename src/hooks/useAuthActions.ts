
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { markLoginSuccess } from "@/utils/loginRedirectUtils";

/**
 * Hook for auth-related actions like logout
 */
const useAuthActions = () => {
  const navigate = useNavigate();
  
  /**
   * Handle user logout
   */
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("You've been logged out successfully");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Failed to log out");
    }
  };

  return {
    logout
  };
};

export default useAuthActions;
