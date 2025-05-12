
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

/**
 * Hook to track user login events and update engagement metrics
 */
export function useLoginTracking(user: User | null, authEvent: string | null) {
  useEffect(() => {
    // Only track when user logs in or session is restored
    if (!user?.id || !["SIGN_IN_COMPLETE", "RESTORED_SESSION"].includes(authEvent || "")) {
      return;
    }

    const trackLogin = async () => {
      try {
        // First, record the login event
        const { error: recordError } = await supabase.rpc("record_user_login", { 
          user_id_param: user.id,
          user_agent_param: navigator.userAgent
        });

        if (recordError) {
          console.error("Error recording login:", recordError);
          
          // Fallback: Update metrics directly if the RPC fails
          const { error: updateError } = await supabase
            .from("user_engagement_metrics")
            .update({
              last_login: new Date().toISOString(),
              // We'll increment login_count in a separate query if RPC failed
            })
            .eq("user_id", user.id);
            
          if (updateError) {
            console.error("Error updating login metrics:", updateError);
          }
        } else {
          console.log("Login event recorded for user:", user.id);
        }

        // Record the login in user_login_history
        const { error: historyError } = await supabase
          .from("user_login_history")
          .insert({
            user_id: user.id,
            user_agent: navigator.userAgent
          });

        if (historyError) {
          console.error("Error recording login history:", historyError);
        }
      } catch (err) {
        console.error("Error tracking login:", err);
      }
    };

    trackLogin();
  }, [user?.id, authEvent]);

  return null;
}
