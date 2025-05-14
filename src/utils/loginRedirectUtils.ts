
/**
 * Improved utility functions for login success tracking
 */

const LOGIN_SUCCESS_KEY = 'login_success_timestamp';

/**
 * Sets a login success flag with a timestamp
 */
export const markLoginSuccess = (): void => {
  // Store minimal timestamp data
  const timestamp = Date.now();
  localStorage.setItem(LOGIN_SUCCESS_KEY, timestamp.toString());
  console.log("Login success marked at", new Date(timestamp).toISOString());
};

/**
 * Clears the login success flag
 */
export const clearLoginSuccess = (): void => {
  console.log("Clearing login success flag");
  localStorage.removeItem(LOGIN_SUCCESS_KEY);
};

/**
 * Checks if login was successful recently (within last 30 seconds)
 * Shortened time window to avoid stale redirects
 */
export const wasLoginSuccessful = (): boolean => {
  const timestamp = localStorage.getItem(LOGIN_SUCCESS_KEY);
  if (timestamp) {
    const loginTime = parseInt(timestamp);
    const thirtySecondsAgo = Date.now() - 30 * 1000; // Reduced from 5 minutes to 30 seconds
    return loginTime > thirtySecondsAgo;
  }
  return false;
};

/**
 * Detect if the app is running as a PWA (standalone mode)
 */
export const isRunningAsPWA = (): boolean => {
  try {
    return window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
  } catch (e) {
    return false;
  }
};

// Add type definition for Window interface
declare global {
  interface Window {
    _isPwaMode?: boolean;
  }
}
