
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

/**
 * Optimized hook for tracking login events without blocking the UI
 * This version uses true non-blocking operations to avoid delaying the UI
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
    
    // Create a non-blocking tracking function using requestAnimationFrame 
    // instead of setTimeout for better performance with the browser's render cycle
    const trackLoginInBackground = () => {
      console.log("Background login tracking started for", user.id);
      
      // Use requestAnimationFrame to truly defer this work
      window.requestAnimationFrame(() => {
        // Record login event - fire and forget
        supabase.rpc("record_user_login", { 
          user_id_param: user.id,
          user_agent_param: navigator.userAgent
        })
        .then(() => console.log("Login event recorded successfully"))
        .then(undefined, err => console.error("Error recording login:", err));
        
        // Update user metrics via edge function - fire and forget
        supabase.functions.invoke('increment-streak', {
          body: { user_id: user.id }
        })
        .then(() => console.log("Streak updated successfully"))
        .then(undefined, err => console.error("Error updating streak:", err));
      });
    };

    // Execute tracking without awaiting results
    trackLoginInBackground();
    
    return () => {
      loginTrackedRef.current = false;
    };
  }, [isAuthenticated, user]);

  return null;
}
