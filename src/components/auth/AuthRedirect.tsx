
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loading } from "@/components/ui/loading";

export function AuthRedirect() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect if on the home page
    if (!isLoading && user && location.pathname !== "/") {
      console.log("AuthRedirect: User already authenticated, redirecting");
      
      // Use a short timeout to prevent potential race conditions
      setTimeout(() => {
        if (!user.onboarded) {
          console.log("Redirecting to onboarding");
          navigate("/onboarding", { replace: true });
        } else {
          console.log("Redirecting to dashboard");
          navigate("/dashboard", { replace: true });
        }
      }, 10);
    }
  }, [user, isLoading, navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center p-8">
        <Loading size="large" />
      </div>
    );
  }

  return null;
}
