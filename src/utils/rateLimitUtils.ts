
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from '@/services/securityLoggingService';

// Constants for rate limiting
const MAX_REQUESTS_PER_MINUTE = 60;
const MAX_REQUESTS_PER_HOUR = 300;
const RATE_LIMIT_WINDOW_MINUTES = 1;
const RATE_LIMIT_WINDOW_HOURS = 1;

// Rate limit types
export type RateLimitPeriod = 'minute' | 'hour' | 'day';

interface RateLimitRequest {
  userId: string;
  endpoint: string;
  period?: RateLimitPeriod;
  maxRequests?: number;
}

/**
 * Checks if a request should be rate limited (mock implementation until database is updated)
 * @param params Rate limit request parameters
 * @returns Object indicating if the request is rate limited and the limit info
 */
export const checkRateLimit = async (params: RateLimitRequest): Promise<{
  isLimited: boolean;
  currentCount: number;
  maxRequests: number;
  resetTime: Date;
}> => {
  const { 
    userId, 
    endpoint, 
    period = 'minute', 
    maxRequests = MAX_REQUESTS_PER_MINUTE 
  } = params;
  
  try {
    // Get current timestamp
    const now = new Date();
    
    // Calculate window start time
    let windowStart: Date;
    let resetTime: Date;
    
    if (period === 'minute') {
      windowStart = new Date(now);
      windowStart.setMinutes(windowStart.getMinutes() - RATE_LIMIT_WINDOW_MINUTES);
      
      resetTime = new Date(now);
      resetTime.setMinutes(resetTime.getMinutes() + 1);
      resetTime.setSeconds(0);
      resetTime.setMilliseconds(0);
    } else if (period === 'hour') {
      windowStart = new Date(now);
      windowStart.setHours(windowStart.getHours() - RATE_LIMIT_WINDOW_HOURS);
      
      resetTime = new Date(now);
      resetTime.setHours(resetTime.getHours() + 1);
      resetTime.setMinutes(0);
      resetTime.setSeconds(0);
      resetTime.setMilliseconds(0);
    } else {
      // For day period
      windowStart = new Date(now);
      windowStart.setDate(windowStart.getDate() - 1);
      
      resetTime = new Date(now);
      resetTime.setDate(resetTime.getDate() + 1);
      resetTime.setHours(0);
      resetTime.setMinutes(0);
      resetTime.setSeconds(0);
      resetTime.setMilliseconds(0);
    }
    
    // For now, return a mock response since the request_logs table doesn't exist
    console.log(`Rate limit check for user ${userId} on endpoint ${endpoint} (period: ${period})`);
    console.log(`This would check for requests since ${windowStart.toISOString()}`);
    
    // Simulate not being rate limited
    const currentCount = 1;
    const isLimited = false;
    
    // If we're rate limiting, log a security event
    if (isLimited) {
      await logSecurityEvent({
        userId,
        eventType: 'rate_limit_exceeded',
        details: { 
          endpoint, 
          period, 
          currentCount, 
          maxRequests 
        }
      });
    }
    
    return {
      isLimited,
      currentCount,
      maxRequests,
      resetTime
    };
    
    /* Uncomment once the request_logs table is created
    const { data, error } = await supabase
      .from('request_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('endpoint', endpoint)
      .gte('created_at', windowStart.toISOString());
      
    if (error) {
      console.error("Error checking rate limit:", error);
      // On error, allow the request but log it
      return { 
        isLimited: false, 
        currentCount: 0, 
        maxRequests, 
        resetTime 
      };
    }
    
    const currentCount = data?.length || 0;
    
    // Log this current request
    await supabase
      .from('request_logs')
      .insert({
        user_id: userId,
        endpoint,
        created_at: now.toISOString()
      });
      
    const isLimited = currentCount >= maxRequests;
    */
  } catch (error) {
    console.error("Error in rate limit check:", error);
    // On error, allow the request
    return { 
      isLimited: false, 
      currentCount: 0, 
      maxRequests, 
      resetTime: new Date(Date.now() + 60000) // 1 minute from now
    };
  }
};

/**
 * Client-side rate limiting function for sensitive actions
 * Uses localStorage to track requests
 * @param action Unique identifier for the action being rate limited
 * @param maxAttempts Maximum number of attempts allowed
 * @param windowMs Time window in milliseconds
 * @returns Whether the action should be allowed or blocked
 */
export const clientRateLimit = (
  action: string,
  maxAttempts: number = 5,
  windowMs: number = 60000 // 1 minute
): { 
  isLimited: boolean;
  attemptsRemaining: number;
  resetTimeMs: number;
} => {
  const storageKey = `rate_limit_${action}`;
  
  try {
    // Get current attempts from localStorage
    const storedData = localStorage.getItem(storageKey);
    const now = Date.now();
    
    if (!storedData) {
      // First attempt
      const newData = {
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
    
    const data = JSON.parse(storedData);
    
    // Check if window has expired
    if (now - data.firstAttempt > windowMs) {
      // Reset window
      const newData = {
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
