
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface RateLimitWarningProps {
  rateLimitInfo: {
    isLimited: boolean;
    attemptsRemaining: number;
    resetTimeMs: number;
  } | null;
}

export function RateLimitWarning({ rateLimitInfo }: RateLimitWarningProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  
  // Timer for rate limit countdown
  useEffect(() => {
    if (!rateLimitInfo?.isLimited) return;
    
    const calculateTimeRemaining = () => {
      const now = Date.now();
      const remaining = Math.max(0, rateLimitInfo.resetTimeMs - now);
      setTimeRemaining(Math.ceil(remaining / 1000)); // Convert to seconds
    };
    
    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(interval);
  }, [rateLimitInfo]);
  
  if (!rateLimitInfo?.isLimited) return null;
  
  return (
    <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md flex items-start gap-2 text-sm">
      <Clock className="h-5 w-5 flex-shrink-0 mt-0.5 text-yellow-600" />
      <div>
        <p className="font-medium">Too many signup attempts</p>
        <p>Please wait {timeRemaining} seconds before trying again.</p>
      </div>
    </div>
  );
}
