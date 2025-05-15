
import { useEffect, useState } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { OnboardingContainer } from "@/components/onboarding/OnboardingContainer";
import { OnboardingLoader } from "@/components/onboarding/OnboardingLoader";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { useAuth } from "@/context/AuthContext";
import { isRetakingAssessment } from "@/utils/navigationUtils";
import { useIsMobile } from "@/hooks/use-mobile";

const OnboardingPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isIOS, setIsIOS] = useState(false);
  
  // Check if user is specifically retaking the assessment
  const isRetaking = isRetakingAssessment(location.search);
  
  // Detect if device is iOS
  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);
  }, []);
  
  useEffect(() => {
    if (!isLoading) {
      console.log("OnboardingPage auth check:", {
        isAuthenticated,
        userOnboarded: user?.onboarded,
        isLoading,
        isRetaking,
        isIOS,
        search: location.search
      });
    }
  }, [isAuthenticated, user, isLoading, isRetaking, location, isIOS]);
  
  if (isLoading) {
    return (
      <PageLayout>
        <OnboardingLoader />
      </PageLayout>
    );
  }
  
  // Determine the appropriate height unit based on device
  const heightClass = isIOS || isMobile ? 'min-h-[100dvh]' : 'min-h-screen';
  
  return (
    <PageLayout>
      <div className={`bg-gradient-to-b from-white to-humanly-gray-lightest ${heightClass}`}>
        <OnboardingProvider>
          <OnboardingContainer />
        </OnboardingProvider>
      </div>
    </PageLayout>
  );
};

export default OnboardingPage;
