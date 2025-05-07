
import { useState } from "react";
import { clientRateLimit, checkRateLimit } from "@/utils/rateLimiting";

export interface RateLimitInfo {
  isLimited: boolean;
  attemptsRemaining: number;
  resetTimeMs: number;
}

export function useSignupRateLimit() {
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);
  
  // Check client-side rate limiting
  const checkClientRateLimit = () => {
    const rateLimit = clientRateLimit('signup_attempt', 5, 60000); // 5 attempts per minute
    if (rateLimit.isLimited) {
      setRateLimitInfo(rateLimit);
      return `Too many signup attempts. Please try again in ${Math.ceil((rateLimit.resetTimeMs - Date.now()) / 1000)} seconds.`;
    }
    return null;
  };
  
  // Check server-side rate limiting
  const checkServerRateLimit = async (email: string): Promise<string | null> => {
    const serverRateLimit = await checkRateLimit({
      email,
      endpoint: 'signup',
      period: 'hour',
      maxRequests: 5 // Stricter limit for signup
    });
    
    if (serverRateLimit.isLimited) {
      setRateLimitInfo({
        isLimited: true,
        attemptsRemaining: 0,
        resetTimeMs: serverRateLimit.resetTime.getTime()
      });
      return `Too many signup attempts from this email. Please try again later.`;
    }
    return null;
  };
  
  // Update rate limit info after a failed attempt
  const updateRateLimitAfterFailure = () => {
    const updatedRateLimit = clientRateLimit('signup_attempt', 5, 60000);
    setRateLimitInfo(updatedRateLimit);
  };

  return {
    rateLimitInfo,
    checkClientRateLimit,
    checkServerRateLimit,
    updateRateLimitAfterFailure
  };
}
