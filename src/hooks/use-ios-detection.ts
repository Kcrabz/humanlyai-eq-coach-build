
import { useState, useEffect } from "react";

export function useIOSDetection() {
  const [isIOS, setIsIOS] = useState(false);
  
  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);
  }, []);

  // Return iOS state and helper function for safe area
  return {
    isIOS,
    getIOSPadding: (defaultPadding: string | number = "16px") => 
      isIOS ? `max(env(safe-area-inset-bottom, 0px), ${defaultPadding})` : defaultPadding
  };
}
