
import { supabase } from '@/integrations/supabase/client';

// Rate limit types
export type RateLimitPeriod = 'minute' | 'hour' | 'day';

export interface RateLimitRequest {
  userId?: string;
  email?: string;
  endpoint: string;
  period?: RateLimitPeriod;
  maxRequests?: number;
}

export interface RateLimitResult {
  isLimited: boolean;
  currentCount: number;
  maxRequests: number;
  resetTime: Date;
}

export interface ClientRateLimitResult {
  isLimited: boolean;
  attemptsRemaining: number;
  resetTimeMs: number;
}

export interface RateLimitStorage {
  attempts: number;
  firstAttempt: number;
  lastAttempt: number;
}
