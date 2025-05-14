
import { useState, useEffect } from "react";

export function useAuthLoadingState(
  isSessionLoading: boolean, 
  isLoadingUser: boolean
) {
  // Consolidated loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // Fast-track loading state updates - optimize to complete faster
  useEffect(() => {
    // Fast path: mark as loaded as soon as we know the session state
    if (!isSessionLoading && !isLoadingUser) {
      setIsLoading(false);
    }
    
    // Safety timeout: force loading to complete after max 500ms
    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        console.log("Auth loading safety timeout triggered");
        setIsLoading(false);
      }
    }, 500);
    
    return () => clearTimeout(safetyTimeout);
  }, [isSessionLoading, isLoadingUser, isLoading]);

  return { isLoading, setIsLoading };
}
