
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
  const { isAuthenticated, isLoading } = useAuth();
  const { isAdmin, isLoading: isAdminLoading } = useAdminCheck();
  const navigate = useNavigate();

  useEffect(() => {
    // Only check once loading is complete
    if (!isLoading && !isAdminLoading) {
      if (!isAuthenticated) {
        toast.error("You must be logged in to access the admin area");
        navigate("/login", { replace: true });
      } else if (!isAdmin) {
        toast.error("You don't have permission to access the admin area");
        navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, isAdminLoading, navigate]);

  if (isLoading || isAdminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="large" />
      </div>
    );
  }

  return isAuthenticated && isAdmin ? <>{children}</> : null;
};
