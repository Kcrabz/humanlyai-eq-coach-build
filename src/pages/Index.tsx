
import { useEffect } from "react";
import LandingPage from "./LandingPage";
import { useAuth } from "@/context/AuthContext";
import { Loading } from "@/components/ui/loading";
import { AuthNavigationService, NavigationState } from "@/services/authNavigationService";

const Index = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Track authentication state but let AuthenticationGuard handle navigation
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Record navigation state - navigation handled by AuthenticationGuard
      console.log("Root page - User authenticated:", { 
        id: user.id, 
        onboarded: user.onboarded 
      });
      
      if (!user.onboarded) {
        AuthNavigationService.setState(NavigationState.ONBOARDING, { 
          userId: user.id, 
          fromRoot: true 
        });
      } else {
        AuthNavigationService.setState(NavigationState.DASHBOARD_READY, { 
          userId: user.id, 
          fromRoot: true 
        });
      }
    }
  }, [isAuthenticated, user, isLoading]);

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading size="large" />
      </div>
    );
  }

  return <LandingPage />;
};

export default Index;
