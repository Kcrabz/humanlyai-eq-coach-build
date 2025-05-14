
/**
 * Enhanced utility functions for login success tracking
 * with more reliable timeout handling and better debugging
 * and improved PWA support
 */

const LOGIN_SUCCESS_KEY = 'login_success_timestamp';
const LOGIN_SUCCESS_DURATION = 90 * 1000; // Extended to 90 seconds for mobile/PWA

/**
 * Sets a login success flag with a timestamp
 */
export const markLoginSuccess = (): void => {
  // Store minimal timestamp data
  const timestamp = Date.now();
  localStorage.setItem(LOGIN_SUCCESS_KEY, timestamp.toString());
  
  const isPwa = isRunningAsPWA();
  console.log(`Login success marked at ${new Date(timestamp).toISOString()} ${isPwa ? "(PWA mode)" : ""}`, {
    key: LOGIN_SUCCESS_KEY,
    duration: `${LOGIN_SUCCESS_DURATION}ms`,
    path: window.location.pathname
  });
  
  // Special handling for PWA mode
  if (isPwa) {
    console.log("Setting PWA login success flags");
    localStorage.setItem('pwa_login_success', 'true');
    sessionStorage.setItem('just_logged_in', 'true');
  }
};

/**
 * Clears the login success flag
 */
export const clearLoginSuccess = (): void => {
  const isPwa = isRunningAsPWA();
  console.log(`Clearing login success flag ${isPwa ? "(PWA mode)" : ""}`, {
    hadFlag: !!localStorage.getItem(LOGIN_SUCCESS_KEY),
    path: window.location.pathname
  });
  
  // Clear all login success related flags
  localStorage.removeItem(LOGIN_SUCCESS_KEY);
  localStorage.removeItem('pwa_login_success');
  sessionStorage.removeItem('just_logged_in');
};

/**
 * Checks if login was successful recently (within extended window)
 * Window extended to 90 seconds for mobile/PWA to ensure redirect logic has time to complete
 */
export const wasLoginSuccessful = (): boolean => {
  const timestamp = localStorage.getItem(LOGIN_SUCCESS_KEY);
  const isPwa = isRunningAsPWA();
  
  if (timestamp) {
    const loginTime = parseInt(timestamp);
    const cutoffTime = Date.now() - LOGIN_SUCCESS_DURATION;
    const isRecent = loginTime > cutoffTime;
    
    console.log(`Checking login success ${isPwa ? "(PWA mode)" : ""}:`, {
      isRecent,
      loginTime: new Date(loginTime).toISOString(),
      age: `${Math.round((Date.now() - loginTime) / 1000)}s`,
      cutoff: `${LOGIN_SUCCESS_DURATION / 1000}s`,
      path: window.location.pathname
    });
    
    return isRecent;
  }
  
  // Special case for PWA mode: check additional flag
  if (isPwa && localStorage.getItem('pwa_login_success') === 'true') {
    console.log("PWA login success flag found, considering login successful");
    return true;
  }
  
  return false;
};

/**
 * Detect if the app is running as a PWA (standalone mode)
 */
export const isRunningAsPWA = (): boolean => {
  try {
    // Check both standard detection and our custom flag
    const isPwa = window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true ||
      localStorage.getItem('is_pwa_mode') === 'true';
    
    if (isPwa) {
      // Ensure our PWA flag is set for consistency
      localStorage.setItem('is_pwa_mode', 'true');
    }
    
    return isPwa;
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
