
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
 * Determines if the current path is the dashboard page
 */
export const isOnDashboardPage = (pathname: string): boolean => {
  return pathname === "/dashboard";
};

/**
 * Determines if the current URL is for retaking the assessment
 * Now supports both direct URL access and programmatic checking
 */
export const isRetakingAssessment = (searchParams?: string): boolean => {
  // If search params are provided, parse them
  if (searchParams) {
    const urlSearchParams = new URLSearchParams(searchParams);
    return urlSearchParams.get('step') === 'archetype';
  }
  
  // Otherwise check current window location
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    return url.searchParams.get('step') === 'archetype';
  }
  
  return false;
};

/**
 * Gets the current search params as an object
 */
export const getCurrentUrlParams = (): Record<string, string> => {
  if (typeof window === 'undefined') {
    return {};
  }
  
  const url = new URL(window.location.href);
  const params: Record<string, string> = {};
  
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return params;
};
