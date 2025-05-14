
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { getAuthFlowState, AuthFlowState } from "@/services/authFlowService";

/**
 * Simplified hook for tracking login events
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
    
    console.log("Login tracking for user:", user.id);
    
    // Record login in background
    const trackLogin = async () => {
      try {
        // Record login event
        await supabase.rpc("record_user_login", { 
          user_id_param: user.id,
          user_agent_param: navigator.userAgent
        });
        
        console.log("Login event recorded successfully");
        
        // Update streak
        await supabase.functions.invoke('increment-streak', {
          body: { user_id: user.id }
        });
        
        console.log("Streak updated successfully");
      } catch (err) {
        console.error("Error in login tracking:", err);
        // Don't block auth flow, just log the error
      }
    };

    // Use setTimeout to avoid blocking the UI thread
    setTimeout(trackLogin, 100);
    
    return () => {
      loginTrackedRef.current = false;
    };
  }, [isAuthenticated, user]);

  // Check auth flow state for login event
  const authState = getAuthFlowState();
  const loginEvent = 
    authState?.state === AuthFlowState.SUCCESS || 
    authState?.state === AuthFlowState.COMPLETE 
      ? "LOGIN_COMPLETE" 
      : null;

  return { loginEvent };
}
