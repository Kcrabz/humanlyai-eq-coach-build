
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const checkIsAdmin = async () => {
      if (!isAuthenticated || !user) {
        console.log("Admin Check: Not authenticated or no user", { isAuthenticated, userId: user?.id });
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        console.log("Admin Check: Checking admin status for user", { email: user.email });
        
        // Call the is_admin database function
        const { data, error } = await supabase.rpc('is_admin');
        
        if (error) {
          console.error("Error checking admin status:", error);
          toast.error("Failed to verify admin status");
          setIsAdmin(false);
        } else {
          console.log("Admin Check: Result", { isAdmin: data });
          setIsAdmin(data || false);
        }
      } catch (error) {
        console.error("Unexpected error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkIsAdmin();
  }, [user, isAuthenticated]);

  return { isAdmin, isLoading };
};
