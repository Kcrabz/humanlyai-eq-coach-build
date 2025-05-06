
import { Button } from "@/components/ui/button";

interface HowItWorksSectionProps {
  onGetStarted: () => void;
}

const HowItWorksSection = ({ onGetStarted }: HowItWorksSectionProps) => {
  return (
    <section className="py-20">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How HumanlyAI Works</h2>
          <p className="text-muted-foreground text-lg">
            Your journey to improved emotional intelligence in three simple steps
          </p>
        </div>
        
        <div className="relative max-w-5xl mx-auto">
          {/* Connection lines for desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-humanly-pastel-lavender via-humanly-indigo/30 to-humanly-pastel-mint z-0"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            <div className="text-center flex flex-col items-center backdrop-blur-sm">
              <div className="w-20 h-20 bg-gradient-to-br from-humanly-indigo to-humanly-indigo-light rounded-full flex items-center justify-center mx-auto mb-6 shadow-soft animate-subtle-bounce">
                <span className="text-white text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Discover Your Archetype</h3>
              <p className="text-muted-foreground">
                Complete a short assessment to determine your EQ style and coaching preferences
              </p>
            </div>
            
            <div className="text-center flex flex-col items-center backdrop-blur-sm">
              <div className="w-20 h-20 bg-gradient-to-br from-humanly-pastel-lavender to-humanly-indigo rounded-full flex items-center justify-center mx-auto mb-6 shadow-soft animate-subtle-bounce" style={{animationDelay: "0.3s"}}>
                <span className="text-white text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Chat With Your Coach</h3>
              <p className="text-muted-foreground">
                Engage in daily conversations tailored to your emotional intelligence needs
              </p>
            </div>
            
            <div className="text-center flex flex-col items-center backdrop-blur-sm">
              <div className="w-20 h-20 bg-gradient-to-br from-humanly-pastel-peach to-humanly-pastel-rose rounded-full flex items-center justify-center mx-auto mb-6 shadow-soft animate-subtle-bounce" style={{animationDelay: "0.6s"}}>
                <span className="text-humanly-indigo-dark text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Track Your Growth</h3>
              <p className="text-muted-foreground">
                Complete challenges and monitor your progress with detailed insights
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-16">
          <Button 
            onClick={onGetStarted} 
            className="bg-gradient-to-r from-humanly-indigo to-humanly-indigo-light hover:shadow-md transition-all duration-500 hover:-translate-y-1"
            size="lg"
          >
            Start Your Free Trial
          </Button>
          <p className="text-muted-foreground mt-4 text-sm">
            No credit card required • 7-day free trial
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
