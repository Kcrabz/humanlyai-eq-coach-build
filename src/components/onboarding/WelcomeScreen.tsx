
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
  
  // Create array of sentences for content
  const contentSentences = [
    "I'm Kai—your EQ coach.",
    "I'm here to help you get better at the stuff that actually matters.",
    "Communicating clearly. Managing your emotions. Responding instead of reacting.",
    "No therapy talk. No fake hype. Just honest coaching to help you grow.",
    "Before we begin, I'll ask you a few quick questions.",
    "It helps me get to know you—and tailor the coaching experience to how you naturally operate."
  ];
  
  // State to track visibility of content sentences
  const [visibleSentences, setVisibleSentences] = useState<boolean[]>(
    Array(contentSentences.length).fill(false)
  );
  
  // Set up animation timing for the word-by-word and sentence-by-sentence appearance
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
    
    // Animate content sentences with specified timing
    const initialDelay = 800; // 0.8s initial delay as requested
    const sentenceStagger = 1200; // 1.2s stagger between sentences
    
    contentSentences.forEach((_, index) => {
      const delay = initialDelay + (index * sentenceStagger);
      
      setTimeout(() => {
        setVisibleSentences(prev => {
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
      className="max-w-2xl mx-auto py-8 px-4 text-center flex flex-col items-center justify-center min-h-[60vh]"
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
        
        {/* New animated content block with sentence-by-sentence animation */}
        <div className="mx-auto max-w-2xl p-4 mb-10 bg-gradient-to-b from-white to-humanly-pastel-mint/10 rounded-xl">
          <div className="text-base md:text-xl font-medium text-humanly-gray-dark leading-relaxed text-center space-y-4">
            {contentSentences.map((sentence, index) => (
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={visibleSentences[index] ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                transition={{ 
                  duration: 0.6,
                  ease: "easeOut"
                }}
                className="mb-3"
              >
                {sentence}
              </motion.p>
            ))}
          </div>
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
