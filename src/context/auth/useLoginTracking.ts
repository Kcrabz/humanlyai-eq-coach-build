
import { useEffect } from "react";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export function useLoginTracking(isAuthenticated: boolean, user: User | null) {
  useEffect(() => {
    const recordLogin = async () => {
      if (!isAuthenticated || !user?.id) return;

      try {
        // Record login using RPC function
        await supabase.rpc('record_user_login', { 
          user_id_param: user.id,
          user_agent_param: navigator.userAgent
        });

        // Call increment-streak function to update user streak
        await supabase.functions.invoke('increment-streak', {
          body: { user_id: user.id }
        });
        
        console.log("Login recorded and streak updated successfully");
      } catch (error) {
        console.error("Failed to record login or update streak:", error);
      }
    };

    recordLogin();
  }, [isAuthenticated, user?.id]);
}
