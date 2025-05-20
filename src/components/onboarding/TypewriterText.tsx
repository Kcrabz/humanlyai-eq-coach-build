
import { motion } from "framer-motion";
import { ReactNode, useState, useEffect } from "react";
import { useAnimationTiming } from "@/hooks/useAnimationTiming";

interface TypewriterTextProps {
  children: string;
  delay?: number;
  duration?: number;
  className?: string;
  showCursor?: boolean;
  cursorStyle?: string;
  speed?: "slow" | "normal" | "fast";
  animationType?: "word" | "character";
}

export const TypewriterText = ({ 
  children, 
  delay = 0,
  duration = 2, 
  className = "",
  showCursor = false,
  cursorStyle = "|",
  speed = "normal",
  animationType = "word"
}: TypewriterTextProps) => {
  const text = children.toString();
  const [isComplete, setIsComplete] = useState(false);
  const { getTypewriterTiming } = useAnimationTiming();
  
  // Calculate stagger delay based on speed setting
  const getStaggerDelay = () => {
    const { charStagger, wordStagger } = getTypewriterTiming(speed);
    return animationType === "character" ? charStagger / 1000 : wordStagger / 1000;
  };
  
  // Handle different animation types
  const getElements = () => {
    if (animationType === "character") {
      return text.split("").map((char, index) => (
        <motion.span
          key={`char-${index}`}
          className="inline-block"
          variants={charChild}
          style={{ 
            display: char === " " ? "inline" : "inline-block",
            width: char === " " ? "0.25em" : "auto"
          }}
        >
          {char}
        </motion.span>
      ));
    }
    
    // Default to word animation
    return text.split(" ").map((word, index) => (
      <motion.span
        key={`word-${index}`}
        className="inline-block"
        variants={wordChild}
        style={{ marginRight: index < text.split(" ").length - 1 ? '0.15em' : '0' }}
      >
        {word}
      </motion.span>
    ));
  };
  
  // Track animation completion to hide cursor
  useEffect(() => {
    const staggerDelay = getStaggerDelay();
    const totalDuration = delay + (text.length * staggerDelay) + 0.5; // Add a small buffer
    
    const timer = setTimeout(() => {
      setIsComplete(true);
    }, totalDuration * 1000);
    
    return () => clearTimeout(timer);
  }, [text, delay, speed]);
  
  // Animation configuration for staggered typing effect
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { 
        staggerChildren: getStaggerDelay(), 
        delayChildren: delay * i 
      }
    }),
    exit: { opacity: 0 }
  };
  
  // Animation for word-level animation
  const wordChild = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100
      }
    },
    hidden: {
      opacity: 0,
      y: 5,
    }
  };
  
  // Animation for character-level animation
  const charChild = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 16,
        stiffness: 120,
      }
    },
    hidden: {
      opacity: 0,
      y: 10,
    }
  };

  return (
    <motion.p
      className={`${className} overflow-wrap-anywhere break-words relative`}
      variants={container}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {getElements()}
      
      {showCursor && !isComplete && (
        <motion.span 
          className="inline-block"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          style={{ marginLeft: '0.1em' }}
        >
          {cursorStyle}
        </motion.span>
      )}
    </motion.p>
  );
};
