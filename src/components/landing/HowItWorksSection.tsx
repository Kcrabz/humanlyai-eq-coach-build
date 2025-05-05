
import { Button } from "@/components/ui/button";

interface HowItWorksSectionProps {
  onGetStarted: () => void;
}

const HowItWorksSection = ({ onGetStarted }: HowItWorksSectionProps) => {
  return (
    <section className="py-16">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold">How HumanlyAI Works</h2>
          <p className="text-muted-foreground mt-4">
            Your journey to improved emotional intelligence in three simple steps
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-humanly-purple/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-humanly-purple text-xl font-bold">1</span>
            </div>
            <h3 className="text-xl font-medium mb-3">Discover Your Archetype</h3>
            <p className="text-muted-foreground">
              Complete a short onboarding to determine your EQ style and coaching preferences
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-humanly-purple/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-humanly-purple text-xl font-bold">2</span>
            </div>
            <h3 className="text-xl font-medium mb-3">Chat With Your Coach</h3>
            <p className="text-muted-foreground">
              Engage in daily conversations tailored to your emotional intelligence needs
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-humanly-purple/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-humanly-purple text-xl font-bold">3</span>
            </div>
            <h3 className="text-xl font-medium mb-3">Track Your Growth</h3>
            <p className="text-muted-foreground">
              Complete challenges and monitor your progress over time with detailed insights
            </p>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <Button onClick={onGetStarted}>
            Start Your Free Trial
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
