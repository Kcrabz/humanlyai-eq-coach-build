
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
    <div className="typing-indicator" aria-label="Kai is typing">
      <div className="typing-dot"></div>
      <div className="typing-dot"></div>
      <div className="typing-dot"></div>
      <style jsx>{`
        .typing-indicator {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          background-color: #f0f0f0;
          border-radius: 16px;
        }
        
        .typing-dot {
          width: 8px;
          height: 8px;
          margin: 0 2px;
          background-color: #666;
          border-radius: 50%;
          opacity: 0.6;
          animation: typingAnimation 1.4s infinite ease-in-out;
        }
        
        .typing-dot:nth-child(1) {
          animation-delay: 0s;
        }
        
        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes typingAnimation {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
      `}</style>
    </div>
  );
}
