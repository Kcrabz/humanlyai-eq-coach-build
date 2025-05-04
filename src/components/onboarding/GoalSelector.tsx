
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/context/OnboardingContext";
import { Input } from "@/components/ui/input";

export function GoalSelector() {
  const [goal, setGoal] = useState("");
  const [isSetting, setIsSetting] = useState(false);
  const { setGoal: updateGoal, completeStep } = useOnboarding();

  const handleNext = async () => {
    if (!goal.trim()) {
      return;
    }

    setIsSetting(true);
    try {
      updateGoal(goal);
      await completeStep("goal");
    } finally {
      setIsSetting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 animate-scale-fade-in">
      {/* Background blobs */}
      <div className="fixed top-20 -left-32 w-64 h-64 bg-humanly-pastel-peach blob-animation -z-10 opacity-40 blob"></div>
      <div className="fixed bottom-20 -right-20 w-80 h-80 bg-humanly-pastel-blue blob-animation-delayed -z-10 opacity-40 blob"></div>
      
      <h1 className="text-3xl md:text-4xl font-semibold mb-6 text-center leading-tight">
        What's your main goal with <span className="text-humanly-teal">emotional intelligence</span> coaching?
      </h1>
      
      <div className="space-y-6 mt-10">
        <div className="relative group">
          <Input
            placeholder="e.g., Improve my relationships, manage stress better..."
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full py-6 px-5 text-base shadow-sm bg-white transition-all duration-300 input-focus-animation rounded-xl"
            autoFocus
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-humanly-teal/20 to-humanly-green/20 rounded-xl blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
        </div>
        
        <Button 
          onClick={handleNext}
          disabled={!goal.trim() || isSetting}
          className="w-full py-6 rounded-xl text-base shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] bg-gradient-to-r from-humanly-teal to-humanly-teal/90"
        >
          {isSetting ? "Setting goal..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}
