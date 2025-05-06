
import { ReactNode, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loading } from "@/components/ui/loading";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    // Only logging, no navigation logic to avoid conflicts with AuthenticationGuard
    console.log("ProtectedRoute auth check:", {
      isAuthenticated,
      isLoading,
      userOnboarded: user?.onboarded,
      pathname: window.location.pathname
    });
  }, [isAuthenticated, isLoading, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="large" />
      </div>
    );
  }

  // Simply render children if authenticated, otherwise render nothing
  // All actual redirections are handled by AuthenticationGuard
  return isAuthenticated ? <>{children}</> : null;
};
