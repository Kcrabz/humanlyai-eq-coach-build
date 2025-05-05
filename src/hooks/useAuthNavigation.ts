
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User } from "@/types";
import { handleAuthNavigation } from "@/services/authNavigationService";
import { isRetakingAssessment } from "@/utils/navigationUtils";

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
    if (!isLoading) {
      console.log("useAuthNavigation effect running with:", {
        pathname: location.pathname,
        search: location.search,
        isRetakingAssessment: isRetakingAssessment(),
        user: user?.id,
        isOnboarded: user?.onboarded
      });
      
      handleAuthNavigation(user, location.pathname, navigate);
    }
  }, [user, isLoading, navigate, location.pathname, location.search]);

  return navigate;
};
