
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
    user, 
    pathname,
    search,
    isAuthenticated: !!user,
    isOnboarded: user?.onboarded,
    isRetaking,
    currentUrl: typeof window !== 'undefined' ? window.location.href : 'SSR',
    currentTime: new Date().toISOString()
  });

  // Special case: User is retaking assessment, allow access to onboarding regardless of onboarded status
  if (isRetaking && isOnOnboardingPage(pathname)) {
    console.log("User is retaking assessment, allowing access to onboarding page");
    return; // Exit early, don't redirect
  }

  // Not authenticated -> redirect to login
  if (!user) {
    if (!isOnAuthPage(pathname) && (isOnChatPage(pathname) || isOnOnboardingPage(pathname))) {
      console.log("User is not authenticated, redirecting to login");
      navigate("/login", { replace: true });
    }
  } 
  // Authenticated but not onboarded -> redirect to onboarding
  else if (user && user.onboarded === false && !isOnOnboardingPage(pathname)) {
    console.log("User is authenticated but not onboarded, redirecting to onboarding");
    navigate("/onboarding", { replace: true });
  }
  // Authenticated and onboarded -> redirect to chat from login/signup/onboarding 
  // UNLESS they're specifically trying to retake an assessment
  else if (user && user.onboarded === true && 
          (isOnAuthPage(pathname) || 
          (isOnOnboardingPage(pathname) && !isRetaking))) {
    console.log("User is authenticated and onboarded, redirecting to chat");
    navigate("/chat", { replace: true });
  }
};
