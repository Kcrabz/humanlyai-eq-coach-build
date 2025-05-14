
import { useEffect } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { OnboardingContainer } from "@/components/onboarding/OnboardingContainer";
import { OnboardingLoader } from "@/components/onboarding/OnboardingLoader";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { useAuth } from "@/context/AuthContext";
import { AuthNavigationService, NavigationState, isRetakingAssessment } from "@/services/authNavigationService";

const OnboardingPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if user is specifically retaking the assessment
  const isRetaking = isRetakingAssessment(location.search);
  
  // Minimal check - let AuthenticationGuard handle main navigation
  useEffect(() => {
    // Only for logging - actual navigation handled by AuthenticationGuard
    if (!isLoading) {
      console.log("OnboardingPage: Auth state resolved", {
        authenticated: isAuthenticated,
        onboarded: user?.onboarded,
        isRetaking
      });
      
      // If user is onboarded and not retaking, set navigation state
      if (user?.onboarded && !isRetaking) {
        console.log("OnboardingPage: User is already onboarded, should redirect");
        AuthNavigationService.setState(NavigationState.DASHBOARD_READY, { userId: user.id });
      } else if (user && !user.onboarded) {
        console.log("OnboardingPage: User needs onboarding");
        AuthNavigationService.setState(NavigationState.ONBOARDING, { userId: user.id });
      }
    }
  }, [isLoading, isAuthenticated, user, isRetaking]);
  
  if (isLoading) {
    return (
      <PageLayout>
        <OnboardingLoader />
      </PageLayout>
    );
  }
  
  return (
    <PageLayout>
      <div className="bg-gradient-to-b from-white to-humanly-gray-lightest min-h-screen">
        <OnboardingProvider>
          <OnboardingContainer />
        </OnboardingProvider>
      </div>
    </PageLayout>
  );
};

export default OnboardingPage;
