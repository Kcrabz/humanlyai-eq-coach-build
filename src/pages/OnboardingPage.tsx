
import { useEffect, useState } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { OnboardingContainer } from "@/components/onboarding/OnboardingContainer";
import { OnboardingLoader } from "@/components/onboarding/OnboardingLoader";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { useAuth } from "@/context/AuthContext";
import { isRetakingAssessment } from "@/utils/navigationUtils";

const OnboardingPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [isPWA, setIsPWA] = useState(false);
  
  // Check if user is specifically retaking the assessment
  const isRetaking = isRetakingAssessment(location.search);
  
  // Detect if running as PWA
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true;
    setIsPWA(isStandalone);
  }, []);
  
  useEffect(() => {
    if (!isLoading) {
      console.log("OnboardingPage auth check:", {
        isAuthenticated,
        userOnboarded: user?.onboarded,
        isLoading,
        isRetaking,
        isPWA,
        search: location.search
      });
    }
  }, [isAuthenticated, user, isLoading, isRetaking, location, isPWA]);
  
  if (isLoading) {
    return (
      <PageLayout>
        <OnboardingLoader />
      </PageLayout>
    );
  }
  
  return (
    <PageLayout>
      <div className={`bg-gradient-to-b from-white to-humanly-gray-lightest min-h-${isPWA ? '100dvh' : '100vh'}`}>
        <OnboardingProvider>
          <OnboardingContainer />
        </OnboardingProvider>
      </div>
    </PageLayout>
  );
};

export default OnboardingPage;
