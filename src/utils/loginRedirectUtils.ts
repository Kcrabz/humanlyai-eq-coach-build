
/**
 * Optimized utility functions for login redirection
 */

const LOGIN_SUCCESS_KEY = 'login_success_timestamp';
const LOGIN_SESSION_KEY = 'login_success';
const JUST_LOGGED_IN_KEY = 'just_logged_in';

/**
 * Sets a login success flag with a timestamp - optimized version
 */
export const markLoginSuccess = (): void => {
  // Store minimal timestamp data
  const timestamp = Date.now();
  localStorage.setItem(LOGIN_SUCCESS_KEY, timestamp.toString());
  sessionStorage.setItem(LOGIN_SESSION_KEY, 'true');
  sessionStorage.setItem(JUST_LOGGED_IN_KEY, 'true');
  
  // Debug log for tracking login flow
  console.log("Login success marked at", new Date(timestamp).toISOString());
  
  // Efficient PWA mode handling
  if (isRunningAsPWA()) {
    if (!sessionStorage.getItem('pwa_desired_path')) {
      // Make sure dashboard is the default post-login destination
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
  sessionStorage.removeItem(JUST_LOGGED_IN_KEY);
};

/**
 * Checks if login was successful recently (within last 5 minutes)
 * Optimized for performance with early return paths
 */
export const wasLoginSuccessful = (): boolean => {
  // Fast path: check session storage first (most efficient)
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
    return true;
  }
  return false;
};

/**
 * Forces a redirect to dashboard using window.location - optimized
 * This version prefers React Router navigation when possible
 */
export const forceRedirectToDashboard = (): void => {
  console.log("Force redirect to dashboard initiated");
  
  // Directly navigate to dashboard
  const alreadyOnDashboard = window.location.pathname === '/dashboard';
  
  // If not already on dashboard, redirect
  if (!alreadyOnDashboard) {
    console.log("Redirecting to dashboard via direct navigation");
    // If in PWA mode, use localStorage to persist the redirect target
    if (isRunningAsPWA()) {
      localStorage.setItem('pwa_redirect_after_login', '/dashboard');
    }
    
    // Use direct navigation for most reliable redirect
    window.location.href = '/dashboard';
  } else {
    console.log("Already on dashboard, no redirect needed");
  }
};

/**
 * Detect if the app is running as a PWA (standalone mode) - optimized with caching
 */
export const isRunningAsPWA = (): boolean => {
  try {
    // Cache the result for consistent checks
    if (typeof window._isPwaMode !== 'undefined') {
      return window._isPwaMode;
    }
    
    // Use the || operator for more concise code
    const result = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    
    window._isPwaMode = result;
    return result;
  } catch (e) {
    return false;
  }
};

// Add type definition to Window interface
declare global {
  interface Window {
    _isPwaMode?: boolean;
  }
}
