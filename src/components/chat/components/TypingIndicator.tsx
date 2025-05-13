import React, { useEffect, useRef, useState } from "react";

export function TypingIndicator() {
  // Keep track of when this indicator was mounted
  const mountTimeRef = useRef(Date.now());
  
  // Add state to self-destruct after maximum lifetime
  const [isExpired, setIsExpired] = useState(false);
  
  // Debug logging to track indicator lifecycle
  useEffect(() => {
    console.log("Typing indicator mounted at", new Date().toISOString());
    
    // Add a self-destruct timer - no typing indicator should live longer than 5 seconds
    // Reduced from 10 seconds to 5 seconds for faster removal
    const maxLifetimeTimer = setTimeout(() => {
      console.log("Force removing typing indicator after timeout");
      setIsExpired(true);
    }, 5000);
    
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
    <div 
      className="flex items-center p-2 px-3 bg-gray-100 rounded-2xl" 
      aria-label="Kai is typing"
    >
      <div className="w-2 h-2 mx-0.5 bg-gray-600 rounded-full opacity-60 animate-bounce" 
           style={{ animationDelay: "0s" }}></div>
      <div className="w-2 h-2 mx-0.5 bg-gray-600 rounded-full opacity-60 animate-bounce" 
           style={{ animationDelay: "0.2s" }}></div>
      <div className="w-2 h-2 mx-0.5 bg-gray-600 rounded-full opacity-60 animate-bounce" 
           style={{ animationDelay: "0.4s" }}></div>
    </div>
  );
}
