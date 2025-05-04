
/**
 * Navigation utility functions for auth-related routing
 */

/**
 * Determines if the current path is an onboarding page
 */
export const isOnOnboardingPage = (pathname: string): boolean => {
  return pathname === "/onboarding";
};

/**
 * Determines if the current path is an authentication page (login or signup)
 */
export const isOnAuthPage = (pathname: string): boolean => {
  return pathname === "/login" || pathname === "/signup";
};

/**
 * Determines if the current path is the chat page
 */
export const isOnChatPage = (pathname: string): boolean => {
  return pathname === "/chat";
};
