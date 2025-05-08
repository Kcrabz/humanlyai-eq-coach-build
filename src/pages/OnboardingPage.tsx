
import { useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { OnboardingContainer } from "@/components/onboarding/OnboardingContainer";
import { OnboardingLoader } from "@/components/onboarding/OnboardingLoader";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { useAuth } from "@/context/AuthContext";
import { isRetakingAssessment } from "@/utils/navigationUtils";

const OnboardingPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  
  // Check if user is specifically retaking the assessment
  const isRetaking = isRetakingAssessment(location.search);
  
  useEffect(() => {
    if (!isLoading) {
      console.log("OnboardingPage auth check:", {
        isAuthenticated,
        userOnboarded: user?.onboarded,
        isRetaking,
        search: location.search
      });
    }
  }, [isAuthenticated, user, isLoading, isRetaking, location]);
  
  if (isLoading) {
    return <OnboardingLoader />;
  }
  
  return (
    <div className="bg-gradient-to-b from-white to-humanly-gray-lightest min-h-screen">
      <OnboardingProvider>
        <OnboardingContainer />
      </OnboardingProvider>
    </div>
  );
};

export default OnboardingPage;
