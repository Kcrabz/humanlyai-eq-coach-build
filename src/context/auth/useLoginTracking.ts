
import { useEffect } from "react";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export function useLoginTracking(user: User | null, authEvent: string | null) {
  useEffect(() => {
    // Record login event when a user successfully logs in
    if (authEvent === "SIGN_IN_COMPLETE" && user?.id) {
      // Use rpc to call our custom function for recording logins
      supabase.rpc('record_user_login', { 
        user_id_param: user.id,
        user_agent_param: navigator.userAgent
      })
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to record login event:", error);
        } else {
          console.log("Login event recorded for user:", user.id);
        }
      });
    }
  }, [user, authEvent]);
}
