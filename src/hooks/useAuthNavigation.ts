
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { User } from "@/types";

export const useAuthNavigation = (user: User | null, isLoading: boolean) => {
  const location = useLocation();
  
  // Only log auth state, don't perform navigation
  useEffect(() => {
    if (!isLoading) {
      console.log("useAuthNavigation (DISABLED): No longer handling navigation", {
        pathname: location.pathname,
        user: user?.id,
        isOnboarded: user?.onboarded
      });
    }
  }, [user, isLoading, location.pathname]);

  return null;
};
