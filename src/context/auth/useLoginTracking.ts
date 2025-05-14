
import { useState, useEffect } from "react";

export function useLoginTracking(authEvent: string | null) {
  const [loginEvent, setLoginEvent] = useState<string | null>(null);
  
  useEffect(() => {
    if (authEvent === 'SIGN_IN_COMPLETE') {
      console.log("Login event detected, setting LOGIN_COMPLETE");
      setLoginEvent('LOGIN_COMPLETE');
      
      // Reset after a delay
      const timer = setTimeout(() => {
        setLoginEvent(null);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [authEvent]);

  // Always return an object with loginEvent property to avoid destructuring errors
  return { loginEvent };
}
