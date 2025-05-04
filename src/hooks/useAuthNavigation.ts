
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@/types";
import { handleAuthNavigation } from "@/services/authNavigationService";

/**
 * Hook that handles authentication-based navigation
 * @param user Current user object
 * @param isLoading Auth loading state
 * @returns The navigate function from react-router
 */
export const useAuthNavigation = (user: User | null, isLoading: boolean) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading) {
      handleAuthNavigation(user, window.location.pathname, navigate);
    }
  }, [user, isLoading, navigate]);

  return navigate;
};
