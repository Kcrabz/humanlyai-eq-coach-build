
import { ReactNode, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loading } from "@/components/ui/loading";
import { useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // Log navigation information for debugging
  useEffect(() => {
    if (isAuthenticated) {
      console.log(`ProtectedRoute: Rendering route ${location.pathname}, auth state: authenticated`);
    }
  }, [isAuthenticated, location.pathname]);
  
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
