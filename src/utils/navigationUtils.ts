
/**
 * Navigation utility functions for auth-related routing
 * @deprecated Use AuthNavigationService from services/authNavigationService.ts instead
 */

import { 
  isOnOnboardingPage as serviceIsOnOnboardingPage,
  isOnAuthPage as serviceIsOnAuthPage,
  isOnChatPage as serviceIsOnChatPage,
  isOnDashboardPage as serviceIsOnDashboardPage,
  isRetakingAssessment as serviceIsRetakingAssessment
} from "@/services/authNavigationService";

/**
 * Determines if the current path is an onboarding page
 * @deprecated Use AuthNavigationService.isOnOnboardingPage instead
 */
export const isOnOnboardingPage = serviceIsOnOnboardingPage;

/**
 * Determines if the current path is an authentication page (login, signup, or password reset)
 * @deprecated Use AuthNavigationService.isOnAuthPage instead
 */
export const isOnAuthPage = serviceIsOnAuthPage;

/**
 * Determines if the current path is the chat page
 * @deprecated Use AuthNavigationService.isOnChatPage instead
 */
export const isOnChatPage = serviceIsOnChatPage;

/**
 * Determines if the current path is the dashboard page
 * @deprecated Use AuthNavigationService.isOnDashboardPage instead
 */
export const isOnDashboardPage = serviceIsOnDashboardPage;

/**
 * Determines if the current URL is for retaking the assessment
 * @deprecated Use AuthNavigationService.isRetakingAssessment instead
 */
export const isRetakingAssessment = serviceIsRetakingAssessment;

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
