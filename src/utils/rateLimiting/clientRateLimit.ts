
import { ClientRateLimitResult, RateLimitStorage } from './types';

/**
 * Client-side rate limiting function for sensitive actions
 * Uses localStorage to track requests
 */
export const clientRateLimit = (
  action: string,
  maxAttempts: number = 5,
  windowMs: number = 60000 // 1 minute
): ClientRateLimitResult => {
  const storageKey = `rate_limit_${action}`;
  
  try {
    // Get current attempts from localStorage
    const storedData = localStorage.getItem(storageKey);
    const now = Date.now();
    
    if (!storedData) {
      // First attempt
      const newData: RateLimitStorage = {
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now
      };
      
      localStorage.setItem(storageKey, JSON.stringify(newData));
      
      return {
        isLimited: false,
        attemptsRemaining: maxAttempts - 1,
        resetTimeMs: now + windowMs
      };
    }
    
    const data = JSON.parse(storedData) as RateLimitStorage;
    
    // Check if window has expired
    if (now - data.firstAttempt > windowMs) {
      // Reset window
      const newData: RateLimitStorage = {
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now
      };
      
      localStorage.setItem(storageKey, JSON.stringify(newData));
      
      return {
        isLimited: false,
        attemptsRemaining: maxAttempts - 1,
        resetTimeMs: now + windowMs
      };
    }
    
    // Within window, check attempts
    if (data.attempts >= maxAttempts) {
      // Rate limited
      const resetTimeMs = data.firstAttempt + windowMs;
      
      return {
        isLimited: true,
        attemptsRemaining: 0,
        resetTimeMs
      };
    }
    
    // Increment attempts
    const newData = {
      attempts: data.attempts + 1,
      firstAttempt: data.firstAttempt,
      lastAttempt: now
    };
    
    localStorage.setItem(storageKey, JSON.stringify(newData));
    
    return {
      isLimited: false,
      attemptsRemaining: maxAttempts - newData.attempts,
      resetTimeMs: data.firstAttempt + windowMs
    };
  } catch (error) {
    console.error("Error in client rate limiting:", error);
    // On error, allow the action
    const currentTime = Date.now();
    return {
      isLimited: false,
      attemptsRemaining: maxAttempts - 1,
      resetTimeMs: currentTime + windowMs
    };
  }
};
