
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

/**
 * Hook to track user login events and update engagement metrics
 */
export function useLoginTracking(isAuthenticated: boolean, user: User | null) {
  // Use a ref to track whether login has already been recorded in this session
  const loginRecordedRef = useRef<boolean>(false);
  
  useEffect(() => {
    // Only track when user is authenticated and login hasn't been recorded yet
    if (!isAuthenticated || !user?.id || loginRecordedRef.current) {
      return;
    }

    const trackLogin = async () => {
      try {
        console.log("Tracking login for user:", user.id);
        loginRecordedRef.current = true;
        
        // First, record the login event
        const { error: recordError } = await supabase.rpc("record_user_login", { 
          user_id_param: user.id,
          user_agent_param: navigator.userAgent
        });

        if (recordError) {
          console.error("Error recording login:", recordError);
          
          try {
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
          } catch (err) {
            console.error("Error in fallback login tracking:", err);
          }
        } else {
          console.log("Login event recorded for user:", user.id);
        }

        // Record the login in user_login_history
        try {
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
          console.error("Error recording login history:", err);
        }
        
        // Trigger streak update - could be moved out of this function if needed
        try {
          await supabase.functions.invoke('increment-streak', {
            body: { user_id: user.id }
          });
          console.log("Streak updated successfully for user:", user.id);
        } catch (err) {
          console.error("Error updating streak:", err);
        }
      } catch (err) {
        console.error("Error tracking login:", err);
      }
    };

    trackLogin();
    
    // Clean up function to reset login tracking if component unmounts
    return () => {
      loginRecordedRef.current = false;
    };
  }, [isAuthenticated, user]);

  return null;
}
