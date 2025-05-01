
import { useState } from "react";
import { ARCHETYPES } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { EQArchetype } from "@/types";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

interface ArchetypeSelectorProps {
  onNext: () => void;
}

export function ArchetypeSelector({ onNext }: ArchetypeSelectorProps) {
  const { user, setArchetype } = useAuth();
  const [selectedArchetype, setSelectedArchetype] = useState<EQArchetype | null>(
    user?.eq_archetype || null
  );

  const handleContinue = () => {
    if (selectedArchetype) {
      setArchetype(selectedArchetype);
      onNext();
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Discover Your EQ Archetype</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Select the profile that best matches your emotional intelligence style.
          This helps us personalize your coaching experience.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(ARCHETYPES).map((archetype) => (
          <Card 
            key={archetype.type}
            className={`cursor-pointer border-2 transition-all ${
              selectedArchetype === archetype.type
                ? "border-humanly-teal bg-humanly-gray-lightest"
                : "border-border hover:border-humanly-teal/30"
            }`}
            onClick={() => setSelectedArchetype(archetype.type)}
          >
            <CardHeader>
              <div className="text-2xl mb-2">{archetype.icon}</div>
              <CardTitle>{archetype.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {archetype.description}
              </p>
            </CardContent>
            <CardFooter>
              <div className="w-full">
                <p className="text-xs font-medium mb-1">Strengths:</p>
                <div className="flex flex-wrap gap-1">
                  {archetype.strengths.map((strength) => (
                    <span 
                      key={strength} 
                      className="px-2 py-1 bg-humanly-teal/10 text-humanly-teal text-xs rounded-full"
                    >
                      {strength}
                    </span>
                  ))}
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-center mt-8">
        <Button onClick={handleContinue} disabled={!selectedArchetype}>
          Continue
        </Button>
      </div>
    </div>
  );
}
