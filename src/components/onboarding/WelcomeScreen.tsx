
import { useOnboarding } from "@/context/OnboardingContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const WelcomeScreen = () => {
  const { completeStep } = useOnboarding();
  
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Meet Your EQ Coach
        </motion.h1>
        
        <div className="space-y-6 mb-10">
          <motion.p 
            className="text-lg text-humanly-gray-dark leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Hey there, I'm Kai, your EQ coach. I'm here to help you get better at the stuff that actually matters. 
            Communicating clearly. Managing your emotions. Responding instead of reacting.
          </motion.p>
          
          <motion.p 
            className="text-lg text-humanly-gray-dark leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            No therapy talk. No fake hype. Just honest coaching to help you grow.
          </motion.p>
          
          <motion.p 
            className="text-lg text-humanly-gray-dark leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Before we begin, I'll ask you a few quick questions. It helps me get to know you, 
            and tailor the coaching experience to best suit your needs.
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Button 
            onClick={() => completeStep("welcome")}
            size="lg"
            className="bg-gradient-to-r from-humanly-indigo to-humanly-teal text-white px-8 py-6 h-auto font-medium text-lg rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
          >
            Let's get started
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};
