
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
import { cn } from "@/lib/utils";

export function CoachingModeSelector() {
  const { state, setCoachingMode, completeStep, goToStep } = useOnboarding();
  const { coachingMode: selectedMode } = state;

  const handleContinue = async () => {
    if (selectedMode) {
      // Wait for the step to complete before proceeding
      await completeStep("coaching");
    }
  };

  const handleBack = () => {
    goToStep("archetype");
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto animate-scale-fade-in">
      {/* Background blobs */}
      <div className="fixed top-20 -left-32 w-64 h-64 bg-humanly-pastel-yellow blob-animation -z-10 opacity-40 blob"></div>
      <div className="fixed bottom-20 -right-20 w-80 h-80 bg-humanly-pastel-lavender blob-animation-delayed -z-10 opacity-40 blob"></div>
      
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-semibold">Choose Your Coaching Style</h1>
        <p className="text-muted-foreground max-w-lg mx-auto text-lg">
          How would you prefer your coach to communicate with you?
          Select the approach that will best motivate your growth.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.values(COACHING_MODES).map((mode) => (
          <Card 
            key={mode.type}
            className={cn(
              "cursor-pointer border-2 transition-all duration-300 selection-card overflow-hidden rounded-xl",
              selectedMode === mode.type
                ? "border-humanly-teal bg-gradient-to-br from-white to-humanly-gray-lightest shadow-soft selected"
                : "border-border hover:border-humanly-teal/30 hover:shadow-soft card-hover"
            )}
            onClick={() => setCoachingMode(mode.type as CoachingMode)}
          >
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">{mode.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {mode.description}
              </p>
              <div className={cn(
                "p-4 rounded-lg border text-sm italic transition-all duration-300", 
                selectedMode === mode.type
                  ? "bg-humanly-pastel-blue border-humanly-pastel-blue"
                  : "bg-humanly-gray-lightest border-gray-100"
              )}>
                "{mode.example}"
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-between mt-10">
        <Button 
          variant="outline" 
          onClick={handleBack}
          className="border-gray-200 hover:bg-gray-50 transition-all duration-300"
        >
          Back
        </Button>
        
        <div className="relative group">
          <Button 
            onClick={handleContinue} 
            disabled={!selectedMode}
            className="py-6 px-8 text-base rounded-xl shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] bg-gradient-to-r from-humanly-teal to-humanly-teal/90"
          >
            Continue
          </Button>
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-humanly-teal/20 to-humanly-green/20 rounded-xl blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
        </div>
      </div>
    </div>
  );
}
