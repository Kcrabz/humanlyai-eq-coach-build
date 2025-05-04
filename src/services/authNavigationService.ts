
import { NavigateFunction } from "react-router-dom";
import { User } from "@/types";
import { isOnAuthPage, isOnChatPage, isOnOnboardingPage } from "@/utils/navigationUtils";

/**
 * Handles authentication-based navigation decisions
 * @param user The current user
 * @param pathname Current URL pathname
 * @param navigate React Router navigation function
 */
export const handleAuthNavigation = (
  user: User | null, 
  pathname: string, 
  navigate: NavigateFunction
): void => {
  console.log("Auth navigation check:", {
    user, 
    pathname,
    isOnboarded: user?.onboarded
  });

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
  else if (user && user.onboarded === true && (isOnAuthPage(pathname) || isOnOnboardingPage(pathname))) {
    console.log("User is authenticated and onboarded, redirecting to chat");
    navigate("/chat", { replace: true });
  }
};
