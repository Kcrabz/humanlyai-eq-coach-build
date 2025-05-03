
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { EQArchetype } from "@/types";
import { toast } from "sonner";

const questions = [
  "I reflect on my emotions before reacting.",
  "I often take quick action without hesitation.",
  "I find it difficult to express how I feel.",
  "I prioritize the needs of others over my own.",
  "I take time to pause and process before responding.",
  "I thrive on momentum and dislike delays.",
  "I keep emotional struggles to myself.",
  "I avoid conflict to maintain harmony.",
  "I prefer thinking over feeling in tough situations.",
  "I struggle to say \"no\" even when I need to.",
  "I am highly self-aware of my emotional state.",
  "I value deep personal connections over tasks.",
  "I feel comfortable sharing vulnerability.",
  "I overanalyze before making decisions.",
  "I often focus more on logic than emotions."
];

interface QuizFormProps {
  onComplete: (archetype: EQArchetype) => void;
}

export function QuizForm({ onComplete }: QuizFormProps) {
  const [answers, setAnswers] = useState<number[]>(Array(15).fill(3));
  const [loading, setLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const handleAnswerChange = (index: number, value: number) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitQuiz = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-eq-archetype", {
        body: {
          answers,
          userId: "anonymous" // We'll update this to use the actual user ID in the edge function
        },
      });

      if (error) throw error;

      const { archetype } = data;
      
      if (!archetype || typeof archetype !== 'string') {
        throw new Error("Invalid archetype response");
      }

      // Pass the archetype to the parent component
      onComplete(archetype as EQArchetype);
      
    } catch (err: any) {
      console.error("Quiz submission failed:", err.message);
      toast.error("Failed to analyze your answers", {
        description: "Please try again later"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {!showResults ? (
        <div className="space-y-6">
          <div className="mb-6">
            <div className="flex justify-between mb-2 text-sm text-muted-foreground">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{Math.round((currentQuestionIndex + 1) / questions.length * 100)}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-humanly-teal h-2 rounded-full transition-all duration-300" 
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium mb-4">
              {questions[currentQuestionIndex]}
            </h3>
            
            <div className="mb-6">
              <Input
                type="range"
                min="1"
                max="5"
                value={answers[currentQuestionIndex]}
                onChange={(e) => handleAnswerChange(currentQuestionIndex, parseInt(e.target.value))}
                className="w-full"
              />
              
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>Strongly Disagree</span>
                <span>Neutral</span>
                <span>Strongly Agree</span>
              </div>
              
              <div className="flex justify-center mt-4">
                <div className="w-10 h-10 rounded-full bg-humanly-teal/10 flex items-center justify-center">
                  <span className="font-semibold text-humanly-teal">{answers[currentQuestionIndex]}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={previousQuestion} 
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              
              {currentQuestionIndex < questions.length - 1 ? (
                <Button onClick={nextQuestion}>Next</Button>
              ) : (
                <Button onClick={() => setShowResults(true)}>Review Answers</Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Your Answers</h2>
            <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
              {questions.map((q, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-sm truncate mr-4">{i + 1}. {q.substring(0, 30)}...</span>
                  <span className="font-medium">{answers[i]}/5</span>
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t">
              <Button 
                className="w-full" 
                onClick={submitQuiz} 
                disabled={loading}
              >
                {loading ? "Analyzing responses..." : "Submit & Get My Archetype"}
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full mt-2" 
                onClick={() => setShowResults(false)}
                disabled={loading}
              >
                Back to Questions
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
