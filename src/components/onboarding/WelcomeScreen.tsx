
import { useOnboarding } from "@/context/OnboardingContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAnimationTiming } from "@/hooks/useAnimationTiming";
import { useEffect, useState } from "react";

export const WelcomeScreen = () => {
  const { completeStep } = useOnboarding();
  const { framerPresets } = useAnimationTiming();
  
  // Create array of messages for chat bubbles
  const messages = [
    "Hey, I'm Kai. Think of me as your EQ coach ... here to help you handle real life a little better each day. Whether it's communication, emotion management, or just making fewer reactive decisions ... I've got you.",
    "No fake hype. No heavy therapy talk. Just honest growth.",
    "Before we dive in, I've got a few quick questions to help me coach you in a way that actually fits."
  ];
  
  // State to track visibility of messages for staggered animation
  const [visibleMessages, setVisibleMessages] = useState<boolean[]>(
    Array(messages.length).fill(false)
  );
  
  // Set up animation timing for the staggered message appearance
  useEffect(() => {
    // Initial delay before showing first message
    const initialDelay = 800; // 0.8s delay for first message
    const messageStagger = 1200; // 1.2s stagger between messages
    
    messages.forEach((_, index) => {
      const delay = initialDelay + (index * messageStagger);
      
      setTimeout(() => {
        setVisibleMessages(prev => {
          const updated = [...prev];
          updated[index] = true;
          return updated;
        });
      }, delay);
    });
  }, []);
  
  return (
    <div className="max-w-2xl mx-auto py-8 px-4 flex flex-col items-center">
      <div className="w-full mb-10">
        {/* Header with avatar/logo */}
        <div className="w-16 h-16 mx-auto mb-8 rounded-full bg-gradient-to-r from-humanly-indigo to-humanly-teal flex items-center justify-center shadow-soft">
          <span className="text-white text-2xl font-bold">👋</span>
        </div>
        
        {/* Chat messages */}
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index} className="flex items-start">
              {/* Avatar */}
              <div className="mr-2 mt-1 flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-humanly-teal-light flex items-center justify-center">
                  <span className="text-white text-xs">K</span>
                </div>
              </div>
              
              {/* Message bubble with animation */}
              <motion.div
                className={`relative bg-muted text-base sm:text-lg font-medium p-4 rounded-2xl max-w-md ${
                  visibleMessages[index] ? "opacity-100" : "opacity-0"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={visibleMessages[index] ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{
                  duration: 0.5,
                  ease: "easeOut"
                }}
              >
                {/* Speech bubble tail */}
                <div 
                  className="absolute left-[-8px] top-4 w-4 h-4 bg-muted transform rotate-45"
                  style={{ borderRadius: '2px' }}
                ></div>
                
                {/* Message content */}
                <div className="relative z-10">{message}</div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
      
      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: visibleMessages[visibleMessages.length - 1] ? 1 : 0,
          y: visibleMessages[visibleMessages.length - 1] ? 0 : 20
        }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-4 flex justify-center"
      >
        <Button 
          onClick={() => completeStep("welcome")} 
          size="lg"
          className="px-8 py-6 text-lg font-medium rounded-xl shadow-md"
        >
          Let's do it
        </Button>
      </motion.div>
    </div>
  );
};
