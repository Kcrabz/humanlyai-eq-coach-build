
import { supabase } from "@/integrations/supabase/client";

// Security event types
export type SecurityEventType = 
  | 'login_success' 
  | 'login_failure' 
  | 'password_reset_requested' 
  | 'password_changed'
  | 'logout'
  | 'account_created'
  | 'profile_updated'
  | 'two_factor_enabled'
  | 'two_factor_disabled'
  | 'suspicious_activity'
  | 'rate_limit_exceeded';

// Risk levels
export type RiskLevel = 'low' | 'medium' | 'high';

// Security event interface
export interface SecurityEvent {
  userId: string;
  eventType: SecurityEventType;
  ip?: string;
  userAgent?: string;
  details?: any;
  riskLevel?: RiskLevel;
}

/**
 * Logs a security event to the database
 * @param event Security event details
 * @returns Success status
 */
export const logSecurityEvent = async (event: SecurityEvent): Promise<boolean> => {
  try {
    // Get IP address and user agent if not provided
    const userAgent = event.userAgent || navigator.userAgent;
    
    // Determine risk level if not provided
    const riskLevel = event.riskLevel || determineRiskLevel(event.eventType);
    
    // Insert the security event record
    const { error } = await supabase
      .from('security_events')
      .insert({
        user_id: event.userId,
        event_type: event.eventType,
        ip_address: event.ip || 'unknown',
        user_agent: userAgent,
        details: event.details || {},
        risk_level: riskLevel,
        created_at: new Date().toISOString()
      });
      
    if (error) {
      console.error("Error logging security event:", error);
      // Fallback to console logging if database fails
      console.warn("Security event:", {
        ...event,
        time: new Date().toISOString(),
        userAgent
      });
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in logSecurityEvent:", error);
    
    // Fallback to console logging
    console.warn("Security event (fallback):", {
      ...event,
      time: new Date().toISOString()
    });
    
    return false;
  }
};

/**
 * Determines the risk level based on event type
 * @param eventType Type of security event
 * @returns Risk level assessment
 */
const determineRiskLevel = (eventType: SecurityEventType): RiskLevel => {
  switch (eventType) {
    case 'login_failure':
    case 'suspicious_activity':
      return 'high';
    
    case 'password_reset_requested':
    case 'password_changed':
    case 'two_factor_disabled':
      return 'medium';
    
    default:
      return 'low';
  }
};

/**
 * Checks for suspicious activity patterns
 * @param userId User ID to check
 * @param eventType Type of event to check
 * @returns True if suspicious pattern detected
 */
export const checkSuspiciousPattern = async (
  userId: string, 
  eventType: SecurityEventType
): Promise<boolean> => {
  try {
    // Example: Check for multiple failed login attempts
    if (eventType === 'login_failure') {
      const from = new Date();
      from.setHours(from.getHours() - 1);
      
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .eq('user_id', userId)
        .eq('event_type', 'login_failure')
        .gte('created_at', from.toISOString());
        
      if (error) {
        console.error("Error checking suspicious pattern:", error);
        return false;
      }
      
      // If 5 or more failed attempts in the last hour, flag as suspicious
      return (data?.length || 0) >= 5;
    }
    
    return false;
  } catch (error) {
    console.error("Error in checkSuspiciousPattern:", error);
    return false;
  }
};
