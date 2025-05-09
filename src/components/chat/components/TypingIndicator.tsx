
import React, { useEffect, useRef, useState } from "react";

export function TypingIndicator() {
  // Keep track of when this indicator was mounted
  const mountTimeRef = useRef(Date.now());
  
  // Add state to self-destruct after maximum lifetime
  const [isExpired, setIsExpired] = useState(false);
  
  // Debug logging to track indicator lifecycle
  useEffect(() => {
    console.log("Typing indicator mounted at", new Date().toISOString());
    
    // Add a self-destruct timer - no typing indicator should live longer than 10 seconds
    const maxLifetimeTimer = setTimeout(() => {
      console.log("Force removing typing indicator after timeout");
      setIsExpired(true);
    }, 10000);
    
    return () => {
      const duration = Date.now() - mountTimeRef.current;
      console.log(`Typing indicator unmounted after ${duration}ms at ${new Date().toISOString()}`);
      clearTimeout(maxLifetimeTimer);
    };
  }, []);
  
  // If expired, render nothing
  if (isExpired) {
    return null;
  }
  
  return (
    <div className="typing-indicator" aria-label="Kai is typing">
      <div className="typing-dot"></div>
      <div className="typing-dot"></div>
      <div className="typing-dot"></div>
    </div>
  );
}
