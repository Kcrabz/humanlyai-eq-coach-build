
import { useEffect } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { OnboardingContainer } from "@/components/onboarding/OnboardingContainer";
import { OnboardingLoader } from "@/components/onboarding/OnboardingLoader";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { useAuth } from "@/context/AuthContext";
import { hasRetakingParameter, getAuthState, AuthState, setAuthState } from "@/services/authService";

const OnboardingPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if user is specifically retaking the assessment
  const isRetaking = hasRetakingParameter(location.search);
  
  // Special case: Redirect onboarded users unless retaking assessment
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.onboarded && !isRetaking) {
      console.log("User is already onboarded, redirecting to dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, user, isLoading, isRetaking, navigate]);
  
  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log("Unauthenticated user on onboarding page, redirecting to login");
      
      // Set auth state to remember where we wanted to go after login
      setAuthState(AuthState.SIGNED_OUT, { returnTo: '/onboarding' });
      
      navigate("/login", { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);
  
  // Set onboarding state when page loads - but avoid redirections
  useEffect(() => {
    if (isAuthenticated && user && !user.onboarded && !isRetaking) {
      setAuthState(AuthState.NEEDS_ONBOARDING);
    }
  }, [isAuthenticated, user, isRetaking]);
  
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
