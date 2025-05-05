
import { Button } from "@/components/ui/button";

interface CtaSectionProps {
  onGetStarted: () => void;
}

const CtaSection = ({ onGetStarted }: CtaSectionProps) => {
  return (
    <section className="py-20 bg-gradient-to-r from-humanly-purple to-humanly-purple-light text-white">
      <div className="container px-4 mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Grow Your EQ?</h2>
        <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
          Start your personalized coaching journey today with a free trial.
          No credit card required.
        </p>
        <Button 
          size="lg" 
          variant="secondary"
          className="bg-white text-humanly-purple hover:bg-humanly-gray-lightest"
          onClick={onGetStarted}
        >
          Get Started Now
        </Button>
        <p className="mt-4 text-sm opacity-75">
          Join thousands of others improving their emotional intelligence
        </p>
      </div>
    </section>
  );
};

export default CtaSection;
