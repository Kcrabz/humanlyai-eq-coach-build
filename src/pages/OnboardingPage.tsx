
import { useEffect } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { OnboardingContainer } from "@/components/onboarding/OnboardingContainer";
import { OnboardingLoader } from "@/components/onboarding/OnboardingLoader";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { useAuth } from "@/context/AuthContext";
import { isRetakingAssessment } from "@/services/authNavigationService";

const OnboardingPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // Check if user is specifically retaking the assessment
  const isRetaking = isRetakingAssessment(location.search);
  
  // Simplified page - let AuthenticationGuard handle navigation
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
