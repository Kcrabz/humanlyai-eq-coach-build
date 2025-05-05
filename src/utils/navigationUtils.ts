
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

/**
 * Determines if the current URL is for retaking the assessment
 */
export const isRetakingAssessment = (): boolean => {
  const url = new URL(window.location.href);
  return url.searchParams.has('step') && url.searchParams.get('step') === 'archetype';
};

/**
 * Gets the current search params as an object
 */
export const getCurrentUrlParams = (): Record<string, string> => {
  const url = new URL(window.location.href);
  const params: Record<string, string> = {};
  
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return params;
};
