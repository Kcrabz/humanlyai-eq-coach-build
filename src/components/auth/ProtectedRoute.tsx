
import { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loading } from "@/components/ui/loading";
import { useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // Skip protection for password reset/update pages
  const isPasswordResetPage = location.pathname === "/reset-password" || location.pathname === "/update-password";
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="large" />
      </div>
    );
  }

  // Allow access to password reset pages even if not authenticated
  if (isPasswordResetPage) {
    return <>{children}</>;
  }

  // Simply render children if authenticated - all redirects handled by AuthenticationGuard
  return isAuthenticated ? <>{children}</> : null;
};
