
import { ReactNode, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loading } from "@/components/ui/loading";
import { useLocation, useNavigate } from "react-router-dom";
import { navigateBasedOnAuthState, getSourceParameter, hasRetakingParameter } from "@/services/authService";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Skip protection for password reset/update pages
  const isPasswordResetPage = location.pathname === "/reset-password" || location.pathname === "/update-password";
  
  // Use the unified navigation service
  useEffect(() => {
    if (!isLoading && !isPasswordResetPage) {
      if (user) {
        // Only check onboarding state once we have user data
        navigateBasedOnAuthState(user, navigate, location.pathname);
      } else if (!isAuthenticated) {
        // Use source parameter to prevent endless redirects
        const source = getSourceParameter(location.search);
        if (source !== 'login' && source !== 'signup') {
          navigate("/login", { replace: true });
        }
      }
    }
  }, [isLoading, isPasswordResetPage, user, isAuthenticated, location, navigate]);
  
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

  // Show loading while auth check is in progress
  if (!isLoading && !isAuthenticated) {
    // Render nothing - navigation will happen in effect
    return null;
  }

  // Simply render children if authenticated - all redirects handled by effect
  return <>{children}</>;
};
