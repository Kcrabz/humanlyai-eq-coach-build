
import { NavigateFunction } from "react-router-dom";
import { User } from "@/types";
import { isOnAuthPage, isOnChatPage, isOnOnboardingPage, isRetakingAssessment } from "@/utils/navigationUtils";

/**
 * Handles authentication-based navigation decisions
 * @param user The current user
 * @param pathname Current URL pathname
 * @param navigate React Router navigation function
 * @param search URL search parameters
 */
export const handleAuthNavigation = (
  user: User | null, 
  pathname: string, 
  navigate: NavigateFunction,
  search?: string
): void => {
  // Check if user is retaking assessment using the search parameter
  const isRetaking = isRetakingAssessment(search);
  
  console.log("Auth navigation handler running:", {
    userId: user?.id,
    pathname,
    search,
    isAuthenticated: !!user,
    isOnboarded: user?.onboarded,
    isRetaking,
    currentUrl: typeof window !== 'undefined' ? window.location.href : 'SSR',
    currentTime: new Date().toISOString()
  });

  // Skip navigation handling for auth pages to prevent redirect loops
  if (isOnAuthPage(pathname)) {
    console.log("On auth page, skipping navigation handling");
    return;
  }

  // Special case: User is retaking assessment, allow access to onboarding regardless of onboarded status
  if (isRetaking && isOnOnboardingPage(pathname)) {
    console.log("User is retaking assessment, allowing access to onboarding page");
    return; // Exit early, don't redirect
  }

  // Not authenticated -> redirect to login (but only for protected pages)
  if (!user) {
    if (isOnChatPage(pathname) || isOnOnboardingPage(pathname)) {
      console.log("User is not authenticated on protected page, redirecting to login");
      navigate("/login", { replace: true });
    }
  } 
  // Authenticated but not onboarded -> redirect to onboarding
  else if (user && user.onboarded === false && !isOnOnboardingPage(pathname)) {
    console.log("User is authenticated but not onboarded, redirecting to onboarding");
    navigate("/onboarding", { replace: true });
  }
  // Authenticated and onboarded -> redirect to chat from onboarding 
  // UNLESS they're specifically trying to retake an assessment
  else if (user && user.onboarded === true) {
    // Only redirect from onboarding unless retaking assessment
    if (isOnOnboardingPage(pathname) && !isRetaking) {
      console.log("User is authenticated and onboarded on onboarding page, redirecting to chat");
      navigate("/chat", { replace: true });
    }
  }
};
