import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ARCHETYPES } from "@/lib/constants";
import { EQArchetype } from "@/types";
import { useOnboarding } from "@/context/OnboardingContext";
import { ArchetypeQuiz } from "./ArchetypeQuiz";

export const ArchetypeSelectorWithQuiz = () => {
  const { state, setArchetype, completeStep } = useOnboarding();
  const [quizMode, setQuizMode] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  
  const handleSelectArchetype = (archetype: EQArchetype) => {
    setArchetype(archetype);
    completeStep("archetype");
  };
  
  const handleQuizResult = (archetype: EQArchetype) => {
    handleSelectArchetype(archetype);
  };
  
  // If quiz mode is selected, directly show the quiz
  if (quizMode) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">
          Discover Your EQ Archetype
        </h1>
        <ArchetypeQuiz 
          onSelect={handleQuizResult} 
          onSkip={() => setManualMode(true)} 
        />
      </div>
    );
  }
  
  // Initial selection screen - choose quiz or manual
  if (!manualMode) {
    return (
      <div className="max-w-lg mx-auto px-4 text-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          Discover Your EQ Archetype
        </h1>
        <p className="mb-8">
          Understanding your emotional intelligence profile helps us provide personalized coaching that matches your unique style.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            onClick={() => setQuizMode(true)}
            className="flex-1 max-w-xs mx-auto"
          >
            Take the Quiz
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => setManualMode(true)}
            className="flex-1 max-w-xs mx-auto"
          >
            Choose Manually
          </Button>
        </div>
      </div>
    );
  }
  
  // Manual selection mode - we'll show cards for each archetype
  return (
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">
        Select Your EQ Archetype
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(ARCHETYPES).map((archetype) => (
          <Card 
            key={archetype.type}
            className={`cursor-pointer transition-all hover:shadow-md ${
              state.archetype === archetype.type ? 'ring-2 ring-humanly-teal' : ''
            }`}
            onClick={() => handleSelectArchetype(archetype.type)}
          >
            <CardContent className="p-6">
              <div className="text-4xl mb-4 text-center">{archetype.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{archetype.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{archetype.description}</p>
              
              <div>
                <h4 className="text-sm font-medium">Strengths:</h4>
                <ul className="text-xs text-gray-600 list-disc list-inside mb-2">
                  {archetype.strengths.map((strength, i) => (
                    <li key={i}>{strength}</li>
                  ))}
                </ul>
                
                <h4 className="text-sm font-medium">Growth Areas:</h4>
                <ul className="text-xs text-gray-600 list-disc list-inside">
                  {archetype.growthAreas.map((area, i) => (
                    <li key={i}>{area}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="text-center mt-8">
        <Button 
          variant="outline" 
          onClick={() => setQuizMode(true)}
        >
          Not sure? Take the Quiz Instead
        </Button>
      </div>
    </div>
  );
};
