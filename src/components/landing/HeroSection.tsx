
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection = ({
  onGetStarted
}: HeroSectionProps) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Set a small delay before triggering the animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  return <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="blob bg-humanly-purple/20 w-[300px] h-[300px] top-[-100px] left-[-100px]" />
      <div className="blob bg-humanly-purple-light/20 w-[400px] h-[400px] bottom-[-200px] right-[-200px]" />
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 
            className={`text-4xl md:text-6xl font-bold mb-6 transition-opacity duration-1000 ease-in-out ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <span className="bg-gradient-to-r from-humanly-purple to-humanly-purple-light bg-clip-text text-transparent">
              HumanlyAI
            </span>
            <span className="block mt-2">Meet Kai, the AI Coach for the Human in You.</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Being human's hard. Growth doesn't have to be.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={onGetStarted}>
              Start Coaching Now
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/pricing")}>
              View Plans
            </Button>
          </div>
          
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-humanly-gray-lightest rounded-lg p-4 text-center">
              <div className="w-12 h-12 mx-auto bg-humanly-purple/10 rounded-full flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-humanly-purple">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <h3 className="font-medium text-lg">Personalized coaching</h3>
              <p className="text-sm text-muted-foreground">
                Tailored to your EQ archetype and preferred coaching style
              </p>
            </div>
            
            <div className="bg-humanly-gray-lightest rounded-lg p-4 text-center">
              <div className="w-12 h-12 mx-auto bg-humanly-purple/10 rounded-full flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-humanly-purple">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
              </div>
              <h3 className="font-medium text-lg">Progress tracking</h3>
              <p className="text-sm text-muted-foreground">
                Monitor your growth with challenges and achievements
              </p>
            </div>
            
            <div className="bg-humanly-gray-lightest rounded-lg p-4 text-center">
              <div className="w-12 h-12 mx-auto bg-humanly-purple/10 rounded-full flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-humanly-purple">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h3 className="font-medium text-lg">Daily support</h3>
              <p className="text-sm text-muted-foreground">
                No fluff. No therapy. Just real growth conversations
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>;
};

export default HeroSection;
