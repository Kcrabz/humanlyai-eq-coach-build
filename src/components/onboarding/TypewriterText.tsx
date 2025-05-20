
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
  
  // Split by words for animation similar to landing page
  const words = text.split(" ");
  
  // Animation configuration for staggered typing effect by word
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: delay * i }
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
      className={`${className} overflow-wrap-anywhere break-words`}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          className="inline-block"
          variants={child}
          style={{ marginRight: index < words.length - 1 ? '0.15em' : '0' }}
        >
          {word}
        </motion.span>
      ))}
    </motion.p>
  );
};
