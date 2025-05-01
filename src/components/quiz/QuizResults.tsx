
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ARCHETYPES } from "@/lib/constants";
import { EQArchetype } from "@/types";
import { Progress } from "@/components/ui/progress";

interface QuizResultsProps {
  dominantArchetype: string;
  scores: Record<string, number>;
  onContinue: () => void;
  onRestart?: () => void;
}

export const QuizResults = ({ 
  dominantArchetype, 
  scores, 
  onContinue,
  onRestart 
}: QuizResultsProps) => {
  // Find the highest score to normalize percentages
  const maxPossibleScore = 20; // Based on our scoring system (5 questions × max 4 points)
  
  // Get the archetype info
  const archetypeInfo = ARCHETYPES[dominantArchetype as EQArchetype];
  
  if (!archetypeInfo) return null;
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="text-center">
        <div className="mb-2 text-4xl">{archetypeInfo.icon}</div>
        <CardTitle className="text-2xl md:text-3xl">Your EQ Archetype: {archetypeInfo.title}</CardTitle>
        <CardDescription className="text-lg">{archetypeInfo.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-medium mb-2">Your Archetype Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(scores).map(([archetype, score]) => {
              const archetypeData = ARCHETYPES[archetype as EQArchetype];
              const percentage = Math.round((score / maxPossibleScore) * 100);
              
              return (
                <div key={archetype} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span>{archetypeData?.title || archetype}</span>
                    <span className="text-sm text-gray-500">{percentage}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 pt-2">
          <div>
            <h3 className="font-medium mb-2">Your Strengths</h3>
            <ul className="list-disc list-inside space-y-1">
              {archetypeInfo.strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Growth Areas</h3>
            <ul className="list-disc list-inside space-y-1">
              {archetypeInfo.growthAreas.map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        {onRestart && (
          <Button variant="outline" onClick={onRestart}>
            Retake Quiz
          </Button>
        )}
        <Button className="flex-1" onClick={onContinue}>
          Continue
        </Button>
      </CardFooter>
    </Card>
  );
};
