
/**
 * Enhanced utility functions for login success tracking
 * with more reliable timeout handling and better debugging
 */

const LOGIN_SUCCESS_KEY = 'login_success_timestamp';
const LOGIN_SUCCESS_DURATION = 60 * 1000; // Extended to 60 seconds from 30

/**
 * Sets a login success flag with a timestamp
 */
export const markLoginSuccess = (): void => {
  // Store minimal timestamp data
  const timestamp = Date.now();
  localStorage.setItem(LOGIN_SUCCESS_KEY, timestamp.toString());
  console.log("Login success marked at", new Date(timestamp).toISOString(), {
    key: LOGIN_SUCCESS_KEY,
    duration: `${LOGIN_SUCCESS_DURATION}ms`,
    path: window.location.pathname
  });
};

/**
 * Clears the login success flag
 */
export const clearLoginSuccess = (): void => {
  console.log("Clearing login success flag", {
    hadFlag: !!localStorage.getItem(LOGIN_SUCCESS_KEY),
    path: window.location.pathname
  });
  localStorage.removeItem(LOGIN_SUCCESS_KEY);
};

/**
 * Checks if login was successful recently (within extended window)
 * Window extended to 60 seconds to ensure redirect logic has time to complete
 * 
 * @param ignoreSourceParam If true, source=dashboard param will be ignored in checks
 */
export const wasLoginSuccessful = (ignoreSourceParam: boolean = false): boolean => {
  // Check URL parameters for source=dashboard which indicates direct navigation
  if (!ignoreSourceParam) {
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('source');
    if (source === 'dashboard') {
      console.log("Skipping login success check due to source=dashboard param");
      return false;
    }
  }
  
  const timestamp = localStorage.getItem(LOGIN_SUCCESS_KEY);
  if (timestamp) {
    const loginTime = parseInt(timestamp);
    const cutoffTime = Date.now() - LOGIN_SUCCESS_DURATION;
    const isRecent = loginTime > cutoffTime;
    
    console.log("Checking login success:", {
      isRecent,
      loginTime: new Date(loginTime).toISOString(),
      age: `${Math.round((Date.now() - loginTime) / 1000)}s`,
      cutoff: `${LOGIN_SUCCESS_DURATION / 1000}s`,
      path: window.location.pathname
    });
    
    return isRecent;
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
