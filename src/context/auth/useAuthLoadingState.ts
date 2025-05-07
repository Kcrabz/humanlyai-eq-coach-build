
import { useState, useEffect } from "react";
import { User } from "@/types";

export function useAuthLoadingState(isSessionLoading: boolean, user: User | null, authEvent: string | null, profileLoaded: boolean) {
  // Consolidated loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // Update loading state when both session and profile are ready
  useEffect(() => {
    console.log("AuthContext loading state updated:", { 
      isSessionLoading, 
      user: user?.id,
      hasSession: !!user,
      authEvent,
      profileLoaded
    });
    
    // Only mark as loaded when session loading is complete
    if (!isSessionLoading) {
      console.log("Auth state fully loaded, setting isLoading to false");
      setIsLoading(false);
    }
  }, [isSessionLoading, user, authEvent, profileLoaded]);

  return { isLoading };
}
