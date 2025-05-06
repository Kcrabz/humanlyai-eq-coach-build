import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

// Constants for rate limiting
const MAX_REQUESTS_PER_MINUTE = 5; // More strict limits for authentication
const MAX_REQUESTS_PER_HOUR = 20;
const RATE_LIMIT_WINDOW_MINUTES = 1;
const RATE_LIMIT_WINDOW_HOURS = 1;

// Rate limit types
export type RateLimitPeriod = 'minute' | 'hour' | 'day';

interface RateLimitRequest {
  userId?: string;
  email?: string;
  endpoint: string;
  period?: RateLimitPeriod;
  maxRequests?: number;
}

/**
 * Checks if a request should be rate limited using the database
 */
export const checkRateLimit = async (params: RateLimitRequest): Promise<{
  isLimited: boolean;
  currentCount: number;
  maxRequests: number;
  resetTime: Date;
}> => {
  const { 
    userId, 
    email,
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
    
    // Build query based on available identifiers
    let query = supabase
      .from('request_logs')
      .select('id')
      .eq('endpoint', endpoint)
      .gte('created_at', windowStart.toISOString());
      
    if (userId) {
      query = query.eq('user_id', userId);
    } else if (email) {
      query = query.eq('email', email);
    }
    
    const { data, error } = await query;
      
    if (error) {
      console.error("Error checking rate limit:", error);
      // On error, default to allowing the request but log warning
      console.warn("Rate limit check failed, allowing request by default");
      return { 
        isLimited: false, 
        currentCount: 0, 
        maxRequests, 
        resetTime 
      };
    }
    
    const currentCount = data?.length || 0;
    
    // Log this current request
    try {
      const ip = "client-side"; // We can't get the real IP client-side, this is just for tracking
      
      await supabase
        .from('request_logs')
        .insert({
          user_id: userId,
          email: email,
          ip_address: ip,
          endpoint,
          created_at: now.toISOString()
        });
    } catch (insertError) {
      console.error("Error logging request:", insertError);
    }
      
    const isLimited = currentCount >= maxRequests;
    
    return {
      isLimited,
      currentCount,
      maxRequests,
      resetTime
    };
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
