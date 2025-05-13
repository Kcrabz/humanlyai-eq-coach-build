
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Activity } from "lucide-react";

interface ArchetypeSettingsProps {
  className?: string;
}

export function ArchetypeSettings({ className }: ArchetypeSettingsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Archetype descriptions
  const archetypeDescriptions: Record<string, string> = {
    reflector: "You're thoughtful and introspective, often processing emotions deeply before responding.",
    activator: "You're action-oriented and energetic, channeling emotions into productive activities.",
    regulator: "You're balanced and steady, able to manage emotions well in challenging situations.",
    connector: "You're empathetic and socially aware, building bridges and nurturing relationships.",
    observer: "You're perceptive and analytical, noticing emotional patterns others might miss.",
    "Not set": "Take the EQ assessment to discover your emotional intelligence archetype."
  };

  const handleRetakeAssessment = () => {
    navigate("/onboarding?step=archetype");
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-humanly-teal" />
          EQ Archetype
        </CardTitle>
        <CardDescription>
          Your emotional intelligence profile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-primary/5 rounded-lg p-4">
          <h3 className="font-medium text-lg capitalize">
            {user?.eq_archetype || "Not set"}
          </h3>
          <p className="text-muted-foreground mt-1">
            {user?.eq_archetype ? 
              archetypeDescriptions[user.eq_archetype] : 
              archetypeDescriptions["Not set"]
            }
          </p>
        </div>
        
        <div>
          <Button 
            onClick={handleRetakeAssessment} 
            variant="outline" 
            className="w-full"
          >
            {user?.eq_archetype ? "Retake EQ Assessment" : "Take EQ Assessment"}
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            The assessment takes about 5 minutes to complete
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
