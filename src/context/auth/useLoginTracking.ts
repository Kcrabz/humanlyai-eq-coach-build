
import { useEffect } from "react";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logSecurityEvent } from "@/services/securityLoggingService";

export function useLoginTracking(user: User | null, authEvent: string | null) {
  useEffect(() => {
    // Record login event when a user successfully logs in
    if (authEvent === "SIGN_IN_COMPLETE" && user?.id) {
      console.log("Attempting to record login for user:", user.id);
      
      // Try RPC method first
      supabase.rpc('record_user_login', { 
        user_id_param: user.id,
        user_agent_param: navigator.userAgent
      })
      .then(({ data, error }) => {
        if (error) {
          console.error("RPC method failed, trying edge function fallback:", error);
          
          // Fallback to edge function if RPC fails
          supabase.functions.invoke('record-user-login', {
            body: { 
              user_id: user.id,
              user_agent: navigator.userAgent
            }
          })
          .then(({ error: edgeFnError }) => {
            if (edgeFnError) {
              console.error("Edge function fallback also failed:", edgeFnError);
            } else {
              console.log("Login recorded via edge function for user:", user.id);
            }
          });
        } else {
          console.log("Login event recorded for user via RPC:", user.id);
          
          // Also log to security events if available
          try {
            logSecurityEvent({
              userId: user.id,
              eventType: 'login_success',
              userAgent: navigator.userAgent,
              details: { method: 'password' },
              riskLevel: 'low'
            });
          } catch (err) {
            // Silently fail as this is just additional logging
            console.warn("Failed to record security event:", err);
          }
        }
      });
    }
  }, [user, authEvent]);
}
