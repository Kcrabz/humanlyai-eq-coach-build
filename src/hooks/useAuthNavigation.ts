
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User } from "@/types";
import { handleAuthNavigation } from "@/services/authNavigationService";
import { isOnAuthPage } from "@/utils/navigationUtils";

/**
 * Hook that handles authentication-based navigation
 * @param user Current user object
 * @param isLoading Auth loading state
 * @returns The navigate function from react-router
 */
export const useAuthNavigation = (user: User | null, isLoading: boolean) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Skip navigation while auth is loading to prevent premature redirects
    if (isLoading) {
      console.log("Auth is still loading, skipping navigation");
      return;
    }
    
    // Skip navigation on auth pages to prevent redirect loops
    if (isOnAuthPage(location.pathname)) {
      console.log("On auth page, skipping navigation handling in hook");
      return;
    }
    
    // Log the current navigation context
    console.log("useAuthNavigation effect running with:", {
      pathname: location.pathname,
      search: location.search,
      user: user?.id,
      isOnboarded: user?.onboarded
    });
    
    handleAuthNavigation(user, location.pathname, navigate, location.search);
  }, [user, isLoading, navigate, location.pathname, location.search]);

  return navigate;
};
