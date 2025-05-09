
import React, { useEffect, useRef } from "react";

export function TypingIndicator() {
  // Keep track of when this indicator was mounted
  const mountTimeRef = useRef(Date.now());
  
  // Debug logging to track indicator lifecycle
  useEffect(() => {
    console.log("Typing indicator mounted at", new Date().toISOString());
    
    return () => {
      const duration = Date.now() - mountTimeRef.current;
      console.log(`Typing indicator unmounted after ${duration}ms at ${new Date().toISOString()}`);
    };
  }, []);
  
  return (
    <div className="typing-indicator" aria-label="Kai is typing">
      <div className="typing-dot"></div>
      <div className="typing-dot"></div>
      <div className="typing-dot"></div>
    </div>
  );
}
