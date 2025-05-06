
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface CtaSectionProps {
  onGetStarted: () => void;
}

const CtaSection = ({ onGetStarted }: CtaSectionProps) => {
  return (
    <section className="py-24 bg-gradient-to-r from-humanly-indigo to-humanly-indigo-light text-white relative overflow-hidden">
      {/* Decorative blobs with animation */}
      <div className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full bg-white/5 blur-3xl animate-float"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl animate-float" style={{animationDelay: "1s"}}></div>
      <div className="absolute top-1/2 left-1/3 w-[200px] h-[200px] rounded-full bg-white/5 blur-3xl animate-float" style={{animationDelay: "1.5s"}}></div>
      
      <div className="container px-4 mx-auto text-center relative z-10">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Grow Your Human Skills?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-xl mx-auto">
            Start your personalized coaching journey today with a free trial.
            No credit card required.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-humanly-indigo hover:bg-humanly-gray-lightest group transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              onClick={onGetStarted}
            >
              Get Started Now
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white/10 transition-all duration-300"
            >
              Get Started Now
            </Button>
          </div>
          
          <p className="mt-8 text-sm opacity-75 flex items-center justify-center gap-1">
            <span className="inline-block w-3 h-3 bg-white rounded-full mr-1 animate-pulse"></span>
            Join thousands of others improving their emotional intelligence
          </p>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
