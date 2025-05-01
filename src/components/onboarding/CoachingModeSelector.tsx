
import { COACHING_MODES } from "@/lib/constants";
import { useOnboarding } from "@/context/OnboardingContext";
import { Button } from "@/components/ui/button";
import { CoachingMode } from "@/types";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
} from "@/components/ui/card";

export function CoachingModeSelector() {
  const { state, setCoachingMode, completeStep, goToStep } = useOnboarding();
  const { coachingMode: selectedMode } = state;

  const handleContinue = () => {
    if (selectedMode) {
      completeStep("coaching");
    }
  };

  const handleBack = () => {
    goToStep("archetype");
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Choose Your Coaching Style</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          How would you prefer your coach to communicate with you?
          Select the approach that will best motivate your growth.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.values(COACHING_MODES).map((mode) => (
          <Card 
            key={mode.type}
            className={`cursor-pointer border-2 transition-all ${
              selectedMode === mode.type
                ? "border-humanly-teal bg-humanly-gray-lightest"
                : "border-border hover:border-humanly-teal/30"
            }`}
            onClick={() => setCoachingMode(mode.type as CoachingMode)}
          >
            <CardHeader>
              <CardTitle>{mode.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {mode.description}
              </p>
              <div className="bg-humanly-gray-lightest p-3 rounded-md border text-sm italic">
                "{mode.example}"
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button onClick={handleContinue} disabled={!selectedMode}>
          Continue
        </Button>
      </div>
    </div>
  );
}
