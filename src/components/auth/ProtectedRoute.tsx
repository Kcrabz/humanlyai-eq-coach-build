
import { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loading } from "@/components/ui/loading";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="large" />
      </div>
    );
  }

  // Simply render children if authenticated - all redirects handled by AuthenticationGuard
  return isAuthenticated ? <>{children}</> : null;
};
