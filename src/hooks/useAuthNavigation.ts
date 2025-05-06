
import { useLocation } from "react-router-dom";

/**
 * This hook has been deprecated and disabled to prevent navigation conflicts.
 * All authentication navigation is now handled by AuthenticationGuard.
 */
export const useAuthNavigation = () => {
  const location = useLocation();
  
  console.log("useAuthNavigation: This hook is disabled and should not be used", {
    pathname: location.pathname,
    timestamp: new Date().toISOString()
  });

  return null;
};
