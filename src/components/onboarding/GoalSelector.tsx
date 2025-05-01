
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useOnboarding } from "@/context/OnboardingContext";

const GOALS = [
  {
    id: "self-awareness",
    title: "Self-Awareness",
    description: "Understand my emotions and reactions better"
  },
  {
    id: "empathy",
    title: "Empathy",
    description: "Better connect with and understand others"
  },
  {
    id: "boundaries",
    title: "Boundaries",
    description: "Set healthier limits in relationships"
  },
  {
    id: "stress",
    title: "Stress Management",
    description: "Handle pressure and anxiety more effectively"
  },
  {
    id: "relationships",
    title: "Relationships",
    description: "Improve personal and professional connections"
  }
];

export function GoalSelector() {
  const { state, setGoal, completeStep } = useOnboarding();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(state.goal);
  
  const handleSelectGoal = (goalId: string) => {
    setSelectedGoal(goalId);
  };
  
  const handleContinue = async () => {
    if (selectedGoal) {
      setGoal(selectedGoal);
      await completeStep("goal");
    }
  };
  
  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">What do you want to improve?</h2>
        <p className="text-muted-foreground">
          Select the area you'd most like to focus on with your EQ coach
        </p>
      </div>
      
      <div className="space-y-3">
        {GOALS.map((goal) => (
          <Card 
            key={goal.id}
            className={`cursor-pointer transition-all ${
              selectedGoal === goal.id ? 'ring-2 ring-humanly-teal' : 'hover:bg-gray-50'
            }`}
            onClick={() => handleSelectGoal(goal.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{goal.title}</h3>
                  <p className="text-sm text-muted-foreground">{goal.description}</p>
                </div>
                {selectedGoal === goal.id && (
                  <div className="h-4 w-4 rounded-full bg-humanly-teal"></div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-8 flex justify-end">
        <Button 
          onClick={handleContinue}
          disabled={!selectedGoal}
        >
          Continue to Assessment
        </Button>
      </div>
    </div>
  );
}
