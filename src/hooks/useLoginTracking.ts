
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

/**
 * Hook to track user login events and update engagement metrics
 * Optimized to run operations in parallel and avoid blocking the UI
 */
export function useLoginTracking(isAuthenticated: boolean, user: User | null) {
  // Use a ref to track whether login has already been recorded in this session
  const loginRecordedRef = useRef<boolean>(false);
  
  useEffect(() => {
    // Only track when user is authenticated and login hasn't been recorded yet
    if (!isAuthenticated || !user?.id || loginRecordedRef.current) {
      return;
    }

    // Mark login as recorded immediately to prevent duplicate tracking
    loginRecordedRef.current = true;
    
    // Create a non-blocking tracking function
    const trackLoginInBackground = async () => {
      console.log("Background tracking login for user:", user.id);
      
      // Use Promise.all to run operations in parallel
      Promise.all([
        // Track 1: Record login event
        (async () => {
          try {
            await supabase.rpc("record_user_login", { 
              user_id_param: user.id,
              user_agent_param: navigator.userAgent
            });
            console.log("Login event recorded successfully");
          } catch (err) {
            console.error("Error recording login:", err);
            
            // Fallback if RPC fails
            try {
              await supabase
                .from("user_login_history")
                .insert({
                  user_id: user.id,
                  user_agent: navigator.userAgent
                });
            } catch (innerErr) {
              console.error("Fallback login tracking failed:", innerErr);
            }
          }
        })(),
        
        // Track 2: Update user metrics (non-critical)
        (async () => {
          try {
            // Update login count using a direct update operation
            await supabase
              .from("user_engagement_metrics")
              .update({
                last_login: new Date().toISOString(),
                login_count: 1  // This will be used in the RLS policy with a calculation
              })
              .eq("user_id", user.id);
          } catch (err) {
            console.error("Error updating login metrics:", err);
          }
        })(),
        
        // Track 3: Update streak (lowest priority)
        (async () => {
          // Slight delay to prioritize UI performance
          setTimeout(async () => {
            try {
              await supabase.functions.invoke('increment-streak', {
                body: { user_id: user.id }
              });
              console.log("Streak updated successfully");
            } catch (err) {
              console.error("Error updating streak:", err);
            }
          }, 1000);
        })()
      ]).catch(error => {
        console.error("Error in parallel login tracking operations:", error);
      });
    };

    // Execute tracking in the background
    trackLoginInBackground();
    
    return () => {
      loginRecordedRef.current = false;
    };
  }, [isAuthenticated, user]);

  return null;
}
