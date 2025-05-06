
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import HeroSection from "@/components/landing/HeroSection";
import ArchetypesSection from "@/components/landing/ArchetypesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CtaSection from "@/components/landing/CtaSection";

interface LandingPageProps {
  displayHeader?: () => void;
}

const LandingPage = ({ displayHeader }: LandingPageProps) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      if (user?.onboarded) {
        navigate("/chat");
      } else {
        navigate("/onboarding");
      }
    } else {
      navigate("/signup");
    }
  };

  return (
    <PageLayout fullWidth delayHeaderAnimation>
      <HeroSection onGetStarted={handleGetStarted} displayHeader={displayHeader} />
      <ArchetypesSection onFindArchetype={handleGetStarted} />
      <HowItWorksSection onGetStarted={handleGetStarted} />
      <TestimonialsSection maxTestimonials={2} />
      <CtaSection onGetStarted={handleGetStarted} />
    </PageLayout>
  );
};

export default LandingPage;
