
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loading } from "@/components/ui/loading";

export function AuthRedirect() {
  const { isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Log only - no redirection logic to avoid conflicts with AuthenticationGuard
    console.log("AuthRedirect: Component mounted", {
      isLoading,
      pathname: location.pathname
    });
  }, [isLoading, location.pathname]);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center p-8">
        <Loading size="large" />
      </div>
    );
  }

  return null;
}
