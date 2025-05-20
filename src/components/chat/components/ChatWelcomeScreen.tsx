
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getWelcomeMessage } from "@/lib/welcomeMessages";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAnimationTiming } from "@/hooks/useAnimationTiming";

interface ChatWelcomeScreenProps {
  sendSuggestedMessage: (content: string) => void;
}

export function ChatWelcomeScreen({ sendSuggestedMessage }: ChatWelcomeScreenProps) {
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const { framerPresets, getStaggerDelay } = useAnimationTiming();
  
  // Generate a welcome message when component mounts
  useEffect(() => {
    setWelcomeMessage(getWelcomeMessage());
  }, []);
  
  // Handler for sending a message - directly calls the passed function
  const handleSendMessage = (content: string) => {
    // Only send non-empty messages
    if (content.trim()) {
      sendSuggestedMessage(content);
    }
  };
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 10
      }
    }
  };
  
  return (
    <motion.div 
      className="flex flex-col items-center justify-center h-full text-center p-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div className="mb-4" variants={item}>
        <span className="inline-block p-4 rounded-full bg-humanly-teal-light/10">
          <MessageSquare className="text-humanly-teal h-6 w-6" />
        </span>
      </motion.div>
      
      <motion.h3 className="text-xl font-medium" variants={item}>
        Start a conversation
      </motion.h3>
      
      <motion.p className="text-muted-foreground mt-2 max-w-md" variants={item}>
        {welcomeMessage || "Send a message to begin your conversation with Kai, your EQ coach."}
      </motion.p>
      
      <motion.p className="text-muted-foreground mt-1 max-w-md" variants={item}>
        Kai will ask questions to understand your situation before offering guidance.
      </motion.p>
      
      <motion.div className="mt-6 space-y-2" variants={item}>
        <p className="text-sm font-medium text-muted-foreground">Try starting with:</p>
        
        <div className="flex flex-wrap gap-2 justify-center">
          <motion.div 
            variants={framerPresets.scaleIn}
            transition={{ delay: getStaggerDelay(0, 0.5, 0.1) }}
          >
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleSendMessage("I've been feeling overwhelmed at work lately.")}
              className="bg-humanly-pastel-lavender/20 border-humanly-indigo/30"
            >
              "I've been feeling overwhelmed at work lately."
            </Button>
          </motion.div>
          
          <motion.div
            variants={framerPresets.scaleIn}
            transition={{ delay: getStaggerDelay(1, 0.5, 0.1) }}
          >
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleSendMessage("I struggle with communicating my needs to others.")}
              className="bg-humanly-pastel-lavender/20 border-humanly-indigo/30"
            >
              "I struggle with communicating my needs to others."
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
