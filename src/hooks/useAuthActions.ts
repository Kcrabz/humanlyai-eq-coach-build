
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { markLoginSuccess } from "@/utils/loginRedirectUtils";

/**
 * Hook for auth-related actions like logout
 * Modified to not directly depend on useNavigate
 */
const useAuthActions = () => {
  /**
   * Handle user logout
   * @param navigate Optional navigate function if available in the component's context
   */
  const logout = async (navigate?: (path: string, options?: any) => void) => {
    try {
      await supabase.auth.signOut();
      toast.success("You've been logged out successfully");
      
      // Use navigate if provided, otherwise fall back to window.location
      if (navigate) {
        navigate("/login", { replace: true });
      } else {
        window.location.href = "/login";
      }
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
