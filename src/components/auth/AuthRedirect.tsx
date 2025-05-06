
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loading } from "@/components/ui/loading";

export function AuthRedirect() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect if still loading or on the home page
    if (isLoading || location.pathname === "/") {
      return;
    }
    
    console.log("AuthRedirect: Checking authentication state", {
      isLoading,
      userExists: !!user,
      userOnboarded: user?.onboarded,
      pathname: location.pathname
    });
    
    if (user) {
      console.log("AuthRedirect: User authenticated, handling redirection");
      
      // Execute redirect immediately
      if (!user.onboarded && location.pathname !== "/onboarding") {
        console.log("Redirecting to onboarding");
        navigate("/onboarding", { replace: true });
      } else if (user.onboarded && 
                (location.pathname === "/login" || 
                 location.pathname === "/signup")) {
        console.log("Redirecting authenticated user to dashboard");
        navigate("/dashboard", { replace: true });
      }
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
