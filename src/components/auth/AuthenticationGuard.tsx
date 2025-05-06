
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { isOnAuthPage, isOnOnboardingPage } from "@/utils/navigationUtils";

/**
 * Global authentication guard component that handles all redirects based on auth state
 */
export const AuthenticationGuard = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    if (isLoading) {
      console.log("AuthGuard: Auth state is still loading, waiting...");
      return;
    }

    console.log("AuthGuard: Authentication check running", { 
      isAuthenticated: !!user, 
      pathname,
      userOnboarded: user?.onboarded,
      timestamp: new Date().toISOString()
    });

    // User is authenticated
    if (user) {
      // If user is on an auth page (login/signup), redirect to appropriate page
      if (isOnAuthPage(pathname)) {
        console.log("AuthGuard: User is authenticated on auth page, redirecting");
        
        if (!user.onboarded) {
          console.log("AuthGuard: Redirecting to onboarding");
          navigate("/onboarding", { replace: true });
        } else {
          console.log("AuthGuard: Redirecting to dashboard");
          navigate("/dashboard", { replace: true });
        }
      }
      // If user is not onboarded but trying to access pages other than onboarding
      else if (!user.onboarded && !isOnOnboardingPage(pathname) && pathname !== "/") {
        console.log("AuthGuard: User is not onboarded, redirecting to onboarding");
        navigate("/onboarding", { replace: true });
      }
    }
    // User is not authenticated but trying to access protected routes
    else if (!user && pathname !== "/" && !isOnAuthPage(pathname)) {
      console.log("AuthGuard: User is not authenticated on protected route, redirecting to login");
      navigate("/login", { replace: true });
    }
  }, [user, isLoading, pathname, navigate]);

  // This component doesn't render anything, just handles redirects
  return null;
};
