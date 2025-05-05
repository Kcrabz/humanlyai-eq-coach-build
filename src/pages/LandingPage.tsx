
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import HeroSection from "@/components/landing/HeroSection";
import ArchetypesSection from "@/components/landing/ArchetypesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CtaSection from "@/components/landing/CtaSection";

const LandingPage = () => {
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
    <div className="flex flex-col min-h-screen">
      <HeroSection onGetStarted={handleGetStarted} />
      <ArchetypesSection onFindArchetype={handleGetStarted} />
      <HowItWorksSection onGetStarted={handleGetStarted} />
      <TestimonialsSection />
      <CtaSection onGetStarted={handleGetStarted} />
    </div>
  );
};

export default LandingPage;
