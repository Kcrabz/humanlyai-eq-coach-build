
import { ReactNode, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loading } from "@/components/ui/loading";
import { useLocation } from "react-router-dom";
import { AuthNavigationService, NavigationState } from "@/services/authNavigationService";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  
  // Log navigation information for debugging
  useEffect(() => {
    if (isAuthenticated) {
      console.log(`ProtectedRoute: Rendering protected content at ${location.pathname}`, {
        userId: user?.id,
        onboarded: user?.onboarded
      });
      
      // Track navigation to protected pages
      AuthNavigationService.setState(NavigationState.AUTHENTICATED, {
        fromProtectedRoute: true,
        pathname: location.pathname,
        userId: user?.id,
        onboarded: user?.onboarded
      });
    } else if (!isLoading) {
      console.log(`ProtectedRoute: Not authenticated for ${location.pathname}, awaiting guard redirect`);
      
      // Track unauthenticated access attempts
      AuthNavigationService.setState(NavigationState.INITIAL, {
        attemptedPath: location.pathname,
        redirectRequired: true
      });
    }
  }, [isAuthenticated, isLoading, location.pathname, user]);
  
  // Simplified to just protect content - navigation handled by AuthenticationGuard
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="large" />
      </div>
    );
  }

  // Simply render children if authenticated - all redirects handled by AuthenticationGuard
  return isAuthenticated ? <>{children}</> : <Loading size="large" />;
};
