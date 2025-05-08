
/**
 * Utility functions to help with login redirection
 */

/**
 * Sets a login success flag with a timestamp
 */
export const markLoginSuccess = (): void => {
  sessionStorage.setItem('login_success', 'true');
  console.log("Login success marked");
};

/**
 * Clears the login success flag
 */
export const clearLoginSuccess = (): void => {
  sessionStorage.removeItem('login_success');
};

/**
 * Checks if login was successful recently
 */
export const wasLoginSuccessful = (): boolean => {
  return sessionStorage.getItem('login_success') === 'true';
};

/**
 * Forces a redirect to dashboard using window.location
 * This is a fallback method when React Router navigation fails
 */
export const forceRedirectToDashboard = (): void => {
  console.log("Forcing redirect to dashboard using window.location");
  window.location.href = '/dashboard';
};
