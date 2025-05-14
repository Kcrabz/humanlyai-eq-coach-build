
import { useState, useEffect } from "react";
import { User } from "@/types";

export function useLoginTracking(authEvent: string | null) {
  const [loginEvent, setLoginEvent] = useState<string | null>(null);
  
  useEffect(() => {
    if (authEvent === 'SIGN_IN_COMPLETE') {
      setLoginEvent('LOGIN_COMPLETE');
      
      // Reset after a delay
      const timer = setTimeout(() => {
        setLoginEvent(null);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [authEvent]);

  return { loginEvent };
}
