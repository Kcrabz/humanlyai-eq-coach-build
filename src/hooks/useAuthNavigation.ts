import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@/types";

export const useAuthNavigation = (user: User | null, isLoading: boolean) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading) {
      // Don't navigate if we're already on the onboarding page
      const isOnOnboardingPage = window.location.pathname === "/onboarding";
      // Also check if we're on any of the auth pages
      const isOnAuthPage = window.location.pathname === "/login" || window.location.pathname === "/signup";
      
      if (user) {
        // If user is authenticated and fully onboarded, redirect to chat from login/signup pages
        if (user.onboarded) {
          if (isOnAuthPage || isOnOnboardingPage) {
            console.log("User is authenticated and onboarded, redirecting to chat");
            navigate("/chat");
          }
        }
        // If user is authenticated but not onboarded, keep them in onboarding flow
        // Only redirect if we're not already on the onboarding page
        else if (!user.onboarded && !isOnOnboardingPage) {
          console.log("User is authenticated but not onboarded, redirecting to onboarding");
          navigate("/onboarding");
        }
      }
    }
  }, [user, isLoading, navigate]);

  return navigate;
};
