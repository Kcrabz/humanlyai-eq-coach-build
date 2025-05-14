
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

/**
 * Optimized hook for tracking login events without blocking the UI
 */
export function useLoginTracking(isAuthenticated: boolean, user: User | null) {
  // Use a ref to prevent duplicate tracking in same session
  const loginTrackedRef = useRef<boolean>(false);
  
  useEffect(() => {
    // Skip if not authenticated, no user, or already tracked in this session
    if (!isAuthenticated || !user?.id || loginTrackedRef.current) {
      return;
    }

    // Mark as tracked immediately to prevent duplicate tracking
    loginTrackedRef.current = true;
    
    // Create a non-blocking tracking function
    const trackLoginInBackground = () => {
      console.log("Background login tracking started for", user.id);
      
      // Use setTimeout to push this to the next event loop tick
      // This prevents blocking UI rendering
      setTimeout(() => {
        // Run operations in parallel for maximum efficiency
        Promise.allSettled([
          // Track 1: Record login event
          supabase.rpc("record_user_login", { 
            user_id_param: user.id,
            user_agent_param: navigator.userAgent
          })
          .then(() => console.log("Login event recorded successfully"))
          .catch(err => console.error("Error recording login:", err)),
          
          // Track 2: Update user metrics via edge function
          supabase.functions.invoke('increment-streak', {
            body: { user_id: user.id }
          })
          .then(() => console.log("Streak updated successfully"))
          .catch(err => console.error("Error updating streak:", err))
        ]).catch(error => {
          console.error("Error in login tracking:", error);
        });
      }, 0);
    };

    // Execute tracking without awaiting results
    trackLoginInBackground();
    
    return () => {
      loginTrackedRef.current = false;
    };
  }, [isAuthenticated, user]);

  return null;
}
