
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface TypewriterTextProps {
  children: string;
  delay?: number;
  duration?: number;
  className?: string;
}

export const TypewriterText = ({ 
  children, 
  delay = 0,
  duration = 2, 
  className = ""
}: TypewriterTextProps) => {
  const text = children.toString();
  
  // Create an array of letters for animation
  const letters = Array.from(text);
  
  // Animation configuration for staggered typing effect
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: delay * i }
    })
  };
  
  const child = {
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

  return (
    <motion.p
      className={className}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          variants={child}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.p>
  );
};
