
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ARCHETYPES } from "@/lib/constants";
import { EQArchetype } from "@/types";
import { Progress } from "@/components/ui/progress";

interface QuizResultsProps {
  result: {
    dominantArchetype: string;
    eqPotentialScore: number;
    scores: Record<string, number>;
    strengths: string[];
    growthAreas: string[];
    eqPotentialCategory: 'High EQ Potential' | 'Developing EQ' | 'Growth Opportunity';
  };
  onContinue: () => void;
  onRestart?: () => void;
}

export const QuizResults = ({ 
  result,
  onContinue,
  onRestart 
}: QuizResultsProps) => {
  // Map new archetypes to legacy archetypes for compatibility with ARCHETYPES constant
  const getArchetypeInfo = (archetype: string) => {
    let legacyType: EQArchetype;
    
    switch(archetype) {
      case 'reflector':
        legacyType = 'reflector';
        break;
      case 'connector':
        legacyType = 'connector';
        break;
      case 'driver':
        legacyType = 'activator'; // Map driver to activator
        break;
      case 'harmonizer':
        legacyType = 'regulator'; // Map harmonizer to regulator
        break;
      default:
        legacyType = 'reflector';
    }
    
    return ARCHETYPES[legacyType];
  };
  
  // Get archetype descriptions based on dominant type
  const getArchetypeDescription = (archetype: string) => {
    switch(archetype) {
      case 'reflector':
        return "You're deeply self-aware and often in tune with your inner world. You're thoughtful, reflective, and naturally introspective. While your inner clarity is strong, your next level lies in building deeper social connections and expressing your insights outwardly.";
      case 'connector':
        return "You're highly empathetic and naturally attuned to others' emotions. People trust you and feel heard in your presence. Your growth edge lies in regulating your own emotions under stress and setting healthy boundaries while maintaining compassion.";
      case 'driver':
        return "You're motivated, goal-driven, and resilient. You thrive on results and have a strong inner fire. Sometimes, your focus on achievement can overlook the emotional undercurrents around you. Growth comes from tuning into emotional nuance—yours and others'.";
      case 'harmonizer':
        return "You have a well-rounded EQ with solid skills across awareness, empathy, and regulation. You're balanced but may seek mastery or depth in specific areas to take your leadership or relationships to the next level.";
      default:
        return "";
    }
  };
  
  // Get growth tips based on dominant type
  const getGrowthTips = (archetype: string) => {
    switch(archetype) {
      case 'reflector':
        return "Work on translating your self-awareness into action and expressing your insights with others.";
      case 'connector':
        return "Practice setting healthy boundaries while still maintaining your natural empathy and connection with others.";
      case 'driver':
        return "Take time to slow down and tune into the emotional nuances in situations before taking action.";
      case 'harmonizer':
        return "Develop deeper mastery in specific EQ areas that resonate most with your personal and professional goals.";
      default:
        return "";
    }
  };
  
  // Find the highest score to normalize percentages
  const maxScore = Math.max(...Object.values(result.scores));
  
  // Get the archetype info
  const archetypeInfo = getArchetypeInfo(result.dominantArchetype);
  
  if (!archetypeInfo) return null;
  
  // Custom title mapping
  const archetypeTitles: Record<string, string> = {
    'reflector': 'The Reflector',
    'connector': 'The Connector',
    'driver': 'The Driver',
    'harmonizer': 'The Harmonizer'
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="text-center">
        <div className="mb-2 text-4xl">{archetypeInfo.icon}</div>
        <CardTitle className="text-2xl md:text-3xl">Your EQ Archetype: {archetypeTitles[result.dominantArchetype]}</CardTitle>
        <CardDescription className="text-lg mt-2">
          {getArchetypeDescription(result.dominantArchetype)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-humanly-teal/10 rounded-lg text-center">
          <h3 className="font-medium mb-1">Your EQ Potential Score: {result.eqPotentialScore} / 75</h3>
          <p className="text-sm">{result.eqPotentialCategory}</p>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Your Archetype Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(result.scores).map(([archetype, score]) => {
              const percentage = Math.round((score / maxScore) * 100);
              
              return (
                <div key={archetype} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span>{archetypeTitles[archetype] || archetype}</span>
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
              {result.strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Growth Areas</h3>
            <ul className="list-disc list-inside space-y-1">
              {result.growthAreas.map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="p-4 border border-humanly-teal/30 rounded-lg">
          <h3 className="font-medium mb-2">Growth Tips</h3>
          <p>{getGrowthTips(result.dominantArchetype)}</p>
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
