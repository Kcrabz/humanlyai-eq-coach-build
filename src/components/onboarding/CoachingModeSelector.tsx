
import { useState } from "react";
import { COACHING_MODES } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { CoachingMode } from "@/types";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
} from "@/components/ui/card";

interface CoachingModeSelectorProps {
  onNext: () => void;
  onBack: () => void;
}

export function CoachingModeSelector({ onNext, onBack }: CoachingModeSelectorProps) {
  const { user, setCoachingMode } = useAuth();
  const [selectedMode, setSelectedMode] = useState<CoachingMode | null>(
    user?.coaching_mode || null
  );

  const handleContinue = () => {
    if (selectedMode) {
      setCoachingMode(selectedMode);
      onNext();
    }
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
            onClick={() => setSelectedMode(mode.type)}
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
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleContinue} disabled={!selectedMode}>
          Continue
        </Button>
      </div>
    </div>
  );
}
