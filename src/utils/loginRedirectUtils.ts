
/**
 * Optimized utility functions for login redirection
 */

const LOGIN_SUCCESS_KEY = 'login_success_timestamp';
const LOGIN_SESSION_KEY = 'login_success';
const JUST_LOGGED_IN_KEY = 'just_logged_in';
const FRESH_CHAT_KEY = 'fresh_chat_needed';

/**
 * Sets a login success flag with a timestamp - optimized version
 */
export const markLoginSuccess = (): void => {
  // Store minimal timestamp data
  const timestamp = Date.now();
  localStorage.setItem(LOGIN_SUCCESS_KEY, timestamp.toString());
  sessionStorage.setItem(LOGIN_SESSION_KEY, 'true');
  sessionStorage.setItem(FRESH_CHAT_KEY, 'true');
  sessionStorage.removeItem('chat_cleared_for_session');
  sessionStorage.setItem(JUST_LOGGED_IN_KEY, 'true');
  
  // Efficient PWA mode handling
  if (isRunningAsPWA()) {
    if (!sessionStorage.getItem('pwa_desired_path')) {
      sessionStorage.setItem('pwa_desired_path', '/dashboard');
    }
  }
};

/**
 * Clears the login success flag - optimized version
 */
export const clearLoginSuccess = (): void => {
  localStorage.removeItem(LOGIN_SUCCESS_KEY);
  sessionStorage.removeItem(LOGIN_SESSION_KEY);
  sessionStorage.removeItem(FRESH_CHAT_KEY);
  sessionStorage.removeItem(JUST_LOGGED_IN_KEY);
};

/**
 * Checks if login was successful recently (within last 5 minutes)
 */
export const wasLoginSuccessful = (): boolean => {
  // Fast path: check session storage first
  if (sessionStorage.getItem(LOGIN_SESSION_KEY) === 'true' || 
      sessionStorage.getItem(JUST_LOGGED_IN_KEY) === 'true') {
    return true;
  }
  
  // Check localStorage with timestamp
  const timestamp = localStorage.getItem(LOGIN_SUCCESS_KEY);
  if (timestamp) {
    const loginTime = parseInt(timestamp);
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return loginTime > fiveMinutesAgo;
  }
  
  return false;
};

/**
 * Checks if this is the first login after page load - optimized version
 */
export const isFirstLoginAfterLoad = (): boolean => {
  const justLoggedIn = sessionStorage.getItem(JUST_LOGGED_IN_KEY) === 'true';
  if (justLoggedIn) {
    // Clear immediately to prevent multiple redirects
    sessionStorage.removeItem(JUST_LOGGED_IN_KEY);
  }
  return justLoggedIn;
};

/**
 * Check if we need to show a fresh chat experience after login
 */
export const shouldShowFreshChat = (): boolean => {
  return sessionStorage.getItem(FRESH_CHAT_KEY) === 'true';
};

/**
 * Forces a redirect to dashboard using window.location - optimized
 */
export const forceRedirectToDashboard = (): void => {
  // If in PWA mode, use a direct approach
  if (isRunningAsPWA()) {
    localStorage.setItem('pwa_redirect_after_login', '/dashboard');
    window.location.href = '/dashboard';
  } else {
    window.location.href = '/dashboard';
  }
};

/**
 * Detect if the app is running as a PWA (standalone mode) - optimized
 */
export const isRunningAsPWA = (): boolean => {
  try {
    // Cache the result for consistent checks within same render cycle
    if (typeof window._isPwaMode !== 'undefined') {
      return window._isPwaMode;
    }
    
    const result = window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any).standalone === true || 
                  window.isPwaMode?.();
    
    window._isPwaMode = result;
    return result;
  } catch (e) {
    return false;
  }
};

// Add type definition to Window interface but don't redeclare isPwaMode
// This fixes the duplicate declaration error
declare global {
  interface Window {
    _isPwaMode?: boolean;
  }
}
