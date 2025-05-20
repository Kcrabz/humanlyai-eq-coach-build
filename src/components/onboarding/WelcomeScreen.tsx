
import { useOnboarding } from "@/context/OnboardingContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const WelcomeScreen = () => {
  const { completeStep } = useOnboarding();
  
  // Create array of messages for chat bubbles
  const messages = [
    "Hey, I'm Kai. Think of me as your EQ coach … here to help you handle real life a little better each day.",
    "Whether it's communication, emotion management, or just making fewer reactive decisions … I've got you.",
    "No fake hype. No heavy therapy talk. Just honest growth.",
    "Before we dive in, I've got a few quick questions to help me coach you in a way that actually fits."
  ];
  
  // State to track visibility of messages for staggered animation
  const [visibleMessages, setVisibleMessages] = useState<boolean[]>(
    Array(messages.length).fill(false)
  );
  
  // Set up animation timing for the staggered message appearance
  useEffect(() => {
    const delays = [500, 1400, 2300, 3200]; // Specific delays per message
    
    messages.forEach((_, index) => {
      setTimeout(() => {
        setVisibleMessages(prev => {
          const updated = [...prev];
          updated[index] = true;
          return updated;
        });
      }, delays[index]);
    });
  }, []);
  
  return (
    <div className="max-w-md mx-auto px-4 py-8 flex flex-col gap-4 items-start justify-center min-h-screen">
      {/* Chat messages */}
      <div className="space-y-4 w-full">
        {messages.map((message, index) => (
          <motion.div
            key={index}
            className={`bg-muted text-base sm:text-lg font-medium p-4 rounded-2xl shadow-sm max-w-md ${
              visibleMessages[index] ? "opacity-100" : "opacity-0"
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={visibleMessages[index] ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{
              duration: 0.5,
              ease: "easeOut"
            }}
          >
            {message}
          </motion.div>
        ))}
      </div>
      
      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: visibleMessages[visibleMessages.length - 1] ? 1 : 0,
          y: visibleMessages[visibleMessages.length - 1] ? 0 : 10
        }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="w-full mt-4"
      >
        <Button 
          onClick={() => completeStep("welcome")} 
          size="lg"
          className="w-full py-6 text-lg font-medium rounded-xl shadow-md"
        >
          Let's do it
        </Button>
      </motion.div>
    </div>
  );
};
