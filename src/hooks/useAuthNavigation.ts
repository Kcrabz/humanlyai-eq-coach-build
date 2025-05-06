
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User } from "@/types";
import { isOnAuthPage } from "@/utils/navigationUtils";

export const useAuthNavigation = (user: User | null, isLoading: boolean) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Skip navigation while auth is loading
    if (isLoading) {
      console.log("Auth is still loading, skipping navigation");
      return;
    }
    
    // Skip navigation for homepage ("/")
    if (location.pathname === "/") {
      console.log("On homepage, allowing access regardless of auth state");
      return;
    }

    console.log("useAuthNavigation effect running:", {
      pathname: location.pathname,
      isAuthPage: isOnAuthPage(location.pathname),
      user: user?.id,
      isOnboarded: user?.onboarded
    });
    
    // If on auth page and user is authenticated, redirect immediately
    if (isOnAuthPage(location.pathname) && user) {
      console.log("Authenticated user on auth page, redirecting immediately");
      if (!user.onboarded) {
        console.log("Authenticated but not onboarded, redirecting to onboarding");
        navigate("/onboarding", { replace: true });
      } else {
        console.log("Authenticated and onboarded, redirecting to dashboard");
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, isLoading, navigate, location.pathname]);

  return navigate;
};
