
import { useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { OnboardingContainer } from "@/components/onboarding/OnboardingContainer";
import { OnboardingLoader } from "@/components/onboarding/OnboardingLoader";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { useAuth } from "@/context/AuthContext";
import { isRetakingAssessment } from "@/utils/navigationUtils";

const OnboardingPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  
  // Check if user is specifically retaking the assessment
  const isRetaking = isRetakingAssessment(location.search);
  
  // Redirect already onboarded users to dashboard
  useEffect(() => {
    if (!isLoading) {
      console.log("OnboardingPage auth check:", {
        isAuthenticated,
        userOnboarded: user?.onboarded,
        isLoading,
        isRetaking,
        search: location.search,
        state: location.state
      });

      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        console.log("User is not authenticated, redirecting to login");
        navigate("/login", { replace: true });
      }
      // If already onboarded and NOT retaking assessment, redirect to dashboard
      else if (user?.onboarded === true && !isRetaking) {
        console.log("User is already onboarded, redirecting to dashboard");
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, user, isLoading, navigate, isRetaking, location]);
  
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
