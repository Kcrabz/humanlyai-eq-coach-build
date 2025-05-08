
/**
 * Utility functions to help with login redirection
 */

/**
 * Sets a login success flag with a timestamp
 */
export const markLoginSuccess = (): void => {
  const timestamp = Date.now();
  localStorage.setItem('login_success_timestamp', timestamp.toString());
  
  // Also set a session storage flag which is cleared when browser closes
  sessionStorage.setItem('login_success', 'true');
  
  // Set a flag to indicate that the chat should be reset for fresh experience
  sessionStorage.setItem('fresh_chat_needed', 'true');
  
  // Remove any previous chat clearing flag to ensure we clear on new login
  sessionStorage.removeItem('chat_cleared_for_session');

  console.log("Login success marked with timestamp", { timestamp });
};

/**
 * Clears the login success flag
 */
export const clearLoginSuccess = (): void => {
  localStorage.removeItem('login_success_timestamp');
  sessionStorage.removeItem('login_success');
};

/**
 * Checks if login was successful recently (within last 5 minutes)
 */
export const wasLoginSuccessful = (): boolean => {
  // First check session storage (cleared when browser closes)
  if (sessionStorage.getItem('login_success') === 'true') {
    return true;
  }
  
  // Then check localStorage with timestamp
  const timestamp = localStorage.getItem('login_success_timestamp');
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
  window.location.href = '/dashboard';
};

/**
 * Checks if a fresh chat experience is needed after login
 * Returns true once, then clears the flag
 */
export const shouldShowFreshChat = (): boolean => {
  const freshChatNeeded = sessionStorage.getItem('fresh_chat_needed') === 'true';
  
  // Clear the flag after checking so it only returns true once
  if (freshChatNeeded) {
    sessionStorage.removeItem('fresh_chat_needed');
    console.log("Fresh chat experience triggered");
  }
  
  return freshChatNeeded;
};
