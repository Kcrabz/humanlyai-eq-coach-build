
import { useState, useEffect } from "react";

export function useIOSDetection() {
  const [isIOS, setIsIOS] = useState(false);
  
  useEffect(() => {
    // Improved detection that handles more edge cases
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);
  }, []);

  // Return iOS state and helpers for various common use cases
  return {
    isIOS,
    // Helper for safe area bottom padding with fallback
    getIOSPadding: (defaultPadding: string | number = "16px") => 
      isIOS ? `max(env(safe-area-inset-bottom, 0px), ${defaultPadding})` : defaultPadding,
    
    // Helper class for conditional iOS styling
    iosClass: isIOS ? 'ios-device' : '',
    
    // Helper function for adding a style object with iOS safe area
    getSafeAreaStyle: (additionalStyles = {}) => ({
      paddingBottom: isIOS ? `max(env(safe-area-inset-bottom, 0px), 16px)` : '16px',
      ...additionalStyles
    })
  };
}
