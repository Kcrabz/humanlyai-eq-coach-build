
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const checkIsAdmin = async () => {
      console.log("useAdminCheck - Starting admin check:", {
        isAuthenticated,
        user: user?.email,
        userId: user?.id
      });
      
      if (!isAuthenticated || !user) {
        console.log("useAdminCheck - User not authenticated or missing");
        setIsAdmin(false);
        setIsLoading(false);
        setIsChecked(true);
        return;
      }

      try {
        console.log("useAdminCheck - Calling is_admin RPC function");
        // Call the is_admin database function
        const { data, error } = await supabase.rpc('is_admin');
        
        if (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        } else {
          console.log("useAdminCheck - is_admin result:", data);
          setIsAdmin(data || false);
        }
      } catch (error) {
        console.error("Unexpected error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
        setIsChecked(true);
      }
    };

    if (isAuthenticated && !isChecked) {
      checkIsAdmin();
    } else if (!isAuthenticated) {
      setIsLoading(false);
      setIsChecked(false);
    }
  }, [user, isAuthenticated, isChecked]);

  return { isAdmin, isLoading };
};
