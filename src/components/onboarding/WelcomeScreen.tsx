
import { useOnboarding } from "@/context/OnboardingContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAnimationTiming } from "@/hooks/useAnimationTiming";
import { useEffect, useState } from "react";

export const WelcomeScreen = () => {
  const { completeStep } = useOnboarding();
  const { framerPresets } = useAnimationTiming();
  
  // State for tracking animated elements
  const [titleVisible, setTitleVisible] = useState(false);
  
  // Create array of words for the title to animate separately
  const titleWords = "Meet Your EQ Coach".split(" ");
  const [visibleTitleWords, setVisibleTitleWords] = useState<boolean[]>(
    Array(titleWords.length).fill(false)
  );
  
  // Create array of words for the main content
  const contentWords = "I'm Kai—your EQ coach. I'm here to help you get better at the stuff that actually matters. Communicating clearly. Managing your emotions. Responding instead of reacting. No therapy talk. No fake hype. Just honest coaching to help you grow. Before we begin, I'll ask you a few quick questions. It helps me get to know you—and tailor the coaching experience to how you naturally operate.".split(" ");
  
  // State to track visibility of content words
  const [visibleContentWords, setVisibleContentWords] = useState<boolean[]>(
    Array(contentWords.length).fill(false)
  );
  
  // Set up animation timing for the word-by-word appearance
  useEffect(() => {
    // Small delay before starting title animation
    const titleTimer = setTimeout(() => {
      setTitleVisible(true);
    }, 300);
    
    // Animate each title word sequentially
    titleWords.forEach((_, index) => {
      const delay = 500 + (index * 120); // Base delay plus staggered timing
      
      setTimeout(() => {
        setVisibleTitleWords(prev => {
          const updated = [...prev];
          updated[index] = true;
          return updated;
        });
      }, delay);
    });
    
    // Animate content words with a delay after title
    const baseContentDelay = 500; // Base delay before starting content animation
    
    contentWords.forEach((_, index) => {
      const delay = baseContentDelay + 1000 + (index * 40); // 40ms stagger as requested (0.04s)
      
      setTimeout(() => {
        setVisibleContentWords(prev => {
          const updated = [...prev];
          updated[index] = true;
          return updated;
        });
      }, delay);
    });
    
    return () => clearTimeout(titleTimer);
  }, []);
  
  return (
    <motion.div 
      className="max-w-2xl mx-auto py-8 px-4 text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative">
        {/* Enhanced background blobs for visual appeal */}
        <div className="absolute top-0 -left-20 w-64 h-64 bg-humanly-pastel-lavender blob-animation -z-10 opacity-40 blob"></div>
        <div className="absolute -bottom-20 -right-10 w-48 h-48 bg-humanly-pastel-mint blob-animation-delayed -z-10 opacity-30 blob"></div>
        
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-humanly-indigo to-humanly-teal flex items-center justify-center shadow-soft transform hover:scale-105 transition-all duration-500">
            <span className="text-white text-2xl font-bold">👋</span>
          </div>
        </div>
        
        <motion.h1 
          className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 tracking-tight"
          {...framerPresets.fadeIn}
          transition={{ delay: 0.2, ...framerPresets.fadeIn.transition }}
        >
          {titleWords.map((word, index) => (
            <span
              key={index}
              className={`inline-block transition-opacity duration-300 ease-in-out ${
                visibleTitleWords[index] ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                transitionDelay: `${index * 0.12}s`,
                marginRight: index < titleWords.length - 1 ? '0.15em' : '0',
                transform: visibleTitleWords[index] ? 'translateY(0)' : 'translateY(5px)',
                transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out'
              }}
            >
              {word}
            </span>
          ))}
        </motion.h1>
        
        {/* New animated content block that replaces TypewriterText components */}
        <div className="mx-auto max-w-xl p-4 mb-10">
          <p className="text-lg md:text-xl font-medium text-humanly-gray-dark leading-relaxed text-center">
            {contentWords.map((word, index) => (
              <span
                key={index}
                className={`inline-block transition-all duration-300 ease-out ${
                  visibleContentWords[index] ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  transitionDelay: `${index * 0.04}s`,
                  marginRight: '0.25em',
                  transform: visibleContentWords[index] ? 'translateY(0)' : 'translateY(10px)',
                }}
              >
                {word}
              </span>
            ))}
          </p>
        </div>
        
        <div className="relative group">
          <Button 
            onClick={() => completeStep("welcome")}
            className="py-6 px-8 text-base rounded-xl shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] bg-gradient-to-r from-humanly-teal to-humanly-teal/90"
          >
            Let's get started
          </Button>
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-humanly-teal/20 to-humanly-green/20 rounded-xl blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
        </div>
      </div>
    </motion.div>
  );
};
