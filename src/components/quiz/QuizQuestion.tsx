
import { QuizQuestion as QuestionType, QuizOption } from './types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup } from "@/components/ui/radio-group";
import { useState } from "react";

interface QuizQuestionProps {
  question: QuestionType;
  onSelect: (optionId: string) => void;
}

export const QuizQuestion = ({ question, onSelect }: QuizQuestionProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  const handleOptionClick = (option: QuizOption) => {
    setSelectedOption(option.id);
  };
  
  const handleSubmit = () => {
    if (selectedOption) {
      onSelect(selectedOption);
      setSelectedOption(null); // Reset for next question
    }
  };
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-xl md:text-2xl">{question.text}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {question.options.map((option) => (
            <div
              key={option.id}
              className={`p-4 border rounded-md cursor-pointer transition-all ${
                selectedOption === option.id 
                  ? "border-humanly-teal bg-humanly-teal/10"
                  : "border-gray-200 hover:border-humanly-teal/50"
              }`}
              onClick={() => handleOptionClick(option)}
            >
              <p>{option.text}</p>
            </div>
          ))}
          
          <div className="pt-4">
            <Button 
              className="w-full" 
              disabled={!selectedOption} 
              onClick={handleSubmit}
            >
              Continue
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
