
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
        // Update last_login in user_engagement_metrics
        const { error: updateError } = await supabase
          .from("user_engagement_metrics")
          .update({
            last_login: new Date().toISOString(),
            login_count: supabase.rpc("record_user_login", { user_id_param: user.id })
          })
          .eq("user_id", user.id);

        if (updateError) {
          console.error("Error updating login metrics:", updateError);
        }

        // Record the login in user_login_history
        const { error: recordError } = await supabase.functions.invoke(
          "record-user-login",
          {
            body: {
              user_id: user.id,
              user_agent: navigator.userAgent,
            },
          }
        );

        if (recordError) {
          console.error("Error recording login:", recordError);
        }
      } catch (err) {
        console.error("Error tracking login:", err);
      }
    };

    trackLogin();
  }, [user?.id, authEvent]);

  return null;
}
