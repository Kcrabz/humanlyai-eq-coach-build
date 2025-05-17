
import { 
  LOGIN_SUCCESS_TIMESTAMP, 
  LOGIN_SUCCESS_SESSION,
  FRESH_CHAT_NEEDED,
  CHAT_CLEARED_SESSION,
  PWA_DESIRED_PATH,
  PWA_AUTH_TIMESTAMP,
  PWA_REDIRECT_AFTER_LOGIN
} from "@/constants/storageKeys";

/**
 * Utility functions to help with login redirection
 */

/**
 * Sets a login success flag with a timestamp
 */
export const markLoginSuccess = (): void => {
  const timestamp = Date.now();
  localStorage.setItem(LOGIN_SUCCESS_TIMESTAMP, timestamp.toString());
  
  // Also set a session storage flag which is cleared when browser closes
  sessionStorage.setItem(LOGIN_SUCCESS_SESSION, 'true');
  
  // Set a flag to indicate that the chat should be reset for fresh experience
  sessionStorage.setItem(FRESH_CHAT_NEEDED, 'true');
  
  // Remove any previous chat clearing flag to ensure we clear on new login
  sessionStorage.removeItem(CHAT_CLEARED_SESSION);

  console.log("Login success marked with timestamp", { timestamp });
  
  // Special handling for PWA mode
  if (window.isPwaMode()) {
    console.log("Login success detected in PWA mode");
    
    // Store dashboard as the default redirect path if nothing else is specified
    if (!sessionStorage.getItem(PWA_DESIRED_PATH)) {
      sessionStorage.setItem(PWA_DESIRED_PATH, '/dashboard');
    }
  }
};

/**
 * Clears the login success flag
 */
export const clearLoginSuccess = (): void => {
  localStorage.removeItem(LOGIN_SUCCESS_TIMESTAMP);
  sessionStorage.removeItem(LOGIN_SUCCESS_SESSION);
  sessionStorage.removeItem(FRESH_CHAT_NEEDED);
};

/**
 * Checks if login was successful recently (within last 5 minutes)
 */
export const wasLoginSuccessful = (): boolean => {
  // First check session storage (cleared when browser closes)
  if (sessionStorage.getItem(LOGIN_SUCCESS_SESSION) === 'true') {
    return true;
  }
  
  // Then check localStorage with timestamp
  const timestamp = localStorage.getItem(LOGIN_SUCCESS_TIMESTAMP);
  if (timestamp) {
    const loginTime = parseInt(timestamp);
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return loginTime > fiveMinutesAgo;
  }
  
  return false;
};

/**
 * Forces a redirect to dashboard using window.location
 * This is a fallback method when React Router navigation fails
 */
export const forceRedirectToDashboard = (): void => {
  console.log("Forcing redirect to dashboard using window.location");
  
  // If in PWA mode, use a slight delay to ensure state is properly updated
  if (window.isPwaMode()) {
    // For PWA, store the redirect in localStorage to persist across page loads
    localStorage.setItem('pwa_redirect_after_login', '/dashboard');
    console.log("Set localStorage redirect for PWA");
    
    // Use timeout to give a chance for other processes to complete
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 100);
  } else {
    window.location.href = '/dashboard';
  }
};

/**
 * Checks if a fresh chat experience is needed after login
 * Returns true once, then clears the flag
 */
export const shouldShowFreshChat = (): boolean => {
  const freshChatNeeded = sessionStorage.getItem(FRESH_CHAT_NEEDED) === 'true';
  
  // Clear the flag after checking so it only returns true once
  if (freshChatNeeded) {
    sessionStorage.removeItem(FRESH_CHAT_NEEDED);
    console.log("Fresh chat experience triggered");
  }
  
  return freshChatNeeded;
};

/**
 * Detect if the app is running as a PWA (standalone mode)
 */
export const isRunningAsPWA = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
};
