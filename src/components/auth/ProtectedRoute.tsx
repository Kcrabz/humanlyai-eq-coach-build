
import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loading } from "@/components/ui/loading";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("ProtectedRoute auth check:", {
      isAuthenticated,
      isLoading,
      userOnboarded: user?.onboarded,
      pathname: window.location.pathname
    });

    if (!isLoading) {
      if (!isAuthenticated) {
        console.log("User not authenticated, redirecting to login");
        navigate("/login", { replace: true });
      } else if (!user?.onboarded && window.location.pathname !== "/onboarding") {
        console.log("User not onboarded, redirecting to onboarding");
        navigate("/onboarding", { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="large" />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
};
