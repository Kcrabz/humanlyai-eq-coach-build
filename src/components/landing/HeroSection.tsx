
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
  const [isLogoVisible, setIsLogoVisible] = useState(false);
  
  // We'll work with individual characters instead of words
  const subtitle = "Meet Kai, the AI Coach for the Human in You.";
  const subtitleParts = [
    // Group 1: "Meet Kai"
    subtitle.slice(0, 8).split(""),
    // Group 2: ", the AI Coach for the Human in You."
    subtitle.slice(8).split("")
  ];
  
  const [visibleLetters, setVisibleLetters] = useState<boolean[][]>(
    subtitleParts.map(part => Array(part.length).fill(false))
  );
  
  useEffect(() => {
    // Set a small delay before triggering the animation for the logo
    const logoTimer = setTimeout(() => {
      setIsLogoVisible(true);
    }, 200);
    
    // First animate "Meet Kai" letters
    subtitleParts[0].forEach((_, index) => {
      const letterTimer = setTimeout(() => {
        setVisibleLetters(prev => {
          const updated = [...prev];
          updated[0] = [...updated[0]];
          updated[0][index] = true;
          return updated;
        });
      }, 600 + (index * 50)); // 50ms stagger between letters
      
      return () => clearTimeout(letterTimer);
    });
    
    // Add a pause after "Meet Kai" before animating the rest
    const pauseTimer = setTimeout(() => {
      // Then animate the rest of the sentence
      subtitleParts[1].forEach((_, index) => {
        const letterTimer = setTimeout(() => {
          setVisibleLetters(prev => {
            const updated = [...prev];
            updated[1] = [...updated[1]];
            updated[1][index] = true;
            return updated;
          });
        }, index * 30); // 30ms stagger between letters for the second part
        
        return () => clearTimeout(letterTimer);
      });
    }, 600 + (subtitleParts[0].length * 50) + 400); // Delay after the first group + 400ms pause
    
    return () => {
      clearTimeout(logoTimer);
      clearTimeout(pauseTimer);
    };
  }, []);
  
  return <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="blob bg-humanly-purple/20 w-[300px] h-[300px] top-[-100px] left-[-100px]" />
      <div className="blob bg-humanly-purple-light/20 w-[400px] h-[400px] bottom-[-200px] right-[-200px]" />
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className={`bg-gradient-to-r from-humanly-purple to-humanly-purple-light bg-clip-text text-transparent transition-opacity duration-1000 ease-in-out ${isLogoVisible ? 'opacity-100' : 'opacity-0'}`}>
              HumanlyAI
            </span>
            <span className="block mt-2">
              {/* First part: "Meet Kai" */}
              {subtitleParts[0].map((letter, letterIndex) => (
                <span 
                  key={`p1-${letterIndex}`} 
                  className="letter-reveal"
                  style={{ 
                    animationDelay: `${600 + (letterIndex * 50)}ms`,
                    animationFillMode: 'forwards'
                  }}
                >
                  {letter}
                </span>
              ))}
              
              {/* Second part: ", the AI Coach for the Human in You." */}
              {subtitleParts[1].map((letter, letterIndex) => (
                <span 
                  key={`p2-${letterIndex}`} 
                  className="letter-reveal"
                  style={{ 
                    animationDelay: `${600 + (subtitleParts[0].length * 50) + 400 + (letterIndex * 30)}ms`,
                    animationFillMode: 'forwards'
                  }}
                >
                  {letter}
                </span>
              ))}
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Being human's hard. Growth doesn't have to be.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={onGetStarted}>Start Chatting Now</Button>
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
