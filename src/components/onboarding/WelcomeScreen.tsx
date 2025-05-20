
import { useOnboarding } from "@/context/OnboardingContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const WelcomeScreen = () => {
  const { completeStep } = useOnboarding();
  
  return (
    <div className="max-w-2xl mx-auto py-8 px-4 text-center">
      <div className="relative">
        {/* Background blobs for visual appeal */}
        <div className="absolute top-0 -left-20 w-64 h-64 bg-humanly-pastel-mint blob-animation -z-10 opacity-50 blob"></div>
        <div className="absolute -bottom-20 -right-10 w-48 h-48 bg-humanly-pastel-lavender blob-animation-delayed -z-10 opacity-40 blob"></div>
        
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-humanly-teal to-humanly-green flex items-center justify-center">
            <span className="text-white text-2xl font-bold">👋</span>
          </div>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">
          Meet Your EQ Coach
        </h1>
        
        <div className="space-y-6 mb-10">
          <p className="text-lg text-gray-700 leading-relaxed">
            Hey there, I'm Kai, your EQ coach. I'm here to help you get better at the stuff that actually matters. 
            Communicating clearly. Managing your emotions. Responding instead of reacting.
          </p>
          
          <p className="text-lg text-gray-700 leading-relaxed">
            No therapy talk. No fake hype. Just honest coaching to help you grow.
          </p>
          
          <p className="text-lg text-gray-700 leading-relaxed">
            Before we begin, I'll ask you a few quick questions. It helps me get to know you, 
            and tailor the coaching experience to best suit your needs.
          </p>
        </div>
        
        <Button 
          onClick={() => completeStep("welcome")}
          size="lg"
          className="bg-gradient-to-r from-humanly-teal to-humanly-green text-white px-8 py-6 h-auto font-medium text-lg rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
        >
          Let's get started
        </Button>
      </div>
    </div>
  );
};
