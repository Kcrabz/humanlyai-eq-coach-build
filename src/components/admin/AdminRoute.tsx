
import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loading } from "@/components/ui/loading";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { toast } from "sonner";

interface AdminRouteProps {
  children: ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { isAdmin, isLoading: isAdminLoading } = useAdminCheck();
  const navigate = useNavigate();

  useEffect(() => {
    // For debugging - helps track authorization issues
    console.log("AdminRoute - Authorization check:", {
      isAuthenticated,
      isAdmin,
      userEmail: user?.email,
      isAuthLoading: isLoading,
      isAdminLoading
    });
    
    // Only check once loading is complete
    if (!isLoading && !isAdminLoading) {
      if (!isAuthenticated) {
        console.log("AdminRoute - Redirecting unauthenticated user to login");
        toast.error("You must be logged in to access the admin area");
        navigate("/login", { replace: true });
      } else if (!isAdmin) {
        console.log("AdminRoute - Blocking non-admin user:", user?.email);
        toast.error("You don't have permission to access the admin area");
        navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, isAdminLoading, navigate, user]);

  if (isLoading || isAdminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="large" />
      </div>
    );
  }

  return isAuthenticated && isAdmin ? <>{children}</> : null;
};
