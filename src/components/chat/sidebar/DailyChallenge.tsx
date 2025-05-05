
import { useState } from "react";
import { Star, Check, ListCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ARCHETYPES } from "@/lib/constants";
import { EQArchetype } from "@/types";

// Define daily challenges based on archetype
const DAILY_CHALLENGES = {
  empath: [
    { id: 1, title: "Set a boundary today", description: "Practice saying 'no' to a request that doesn't align with your priorities." },
    { id: 2, title: "Notice emotional patterns", description: "Identify when you're taking on others' emotions instead of your own." },
    { id: 3, title: "Practice self-compassion", description: "Take 5 minutes to speak to yourself as kindly as you speak to others." }
  ],
  validator: [
    { id: 1, title: "Express appreciation", description: "Share genuine gratitude with someone for something specific they did." },
    { id: 2, title: "Embrace uncertainty", description: "Identify one situation where you can let go of needing to be right." },
    { id: 3, title: "Ask open questions", description: "Practice curiosity by asking questions without judgment." }
  ],
  innovator: [
    { id: 1, title: "Listen fully", description: "Have a conversation where you focus entirely on listening, not planning your response." },
    { id: 2, title: "Acknowledge feelings", description: "Notice and name your emotions throughout the day without judgment." },
    { id: 3, title: "Slow down responses", description: "Take 3 deep breaths before responding in challenging conversations." }
  ],
  harmonizer: [
    { id: 1, title: "Express disagreement", description: "Practice saying your honest opinion even when it differs from others." },
    { id: 2, title: "Notice people-pleasing", description: "Identify moments when you're prioritizing others' comfort over your authenticity." },
    { id: 3, title: "Self-celebration", description: "Acknowledge one accomplishment today without downplaying it." }
  ],
  commander: [
    { id: 1, title: "Practice patience", description: "When feeling rushed, pause and ask if immediate action is truly necessary." },
    { id: 2, title: "Validate others' feelings", description: "When someone shares an emotion, acknowledge it before problem-solving." },
    { id: 3, title: "Notice control impulses", description: "Identify one situation where you can delegate or let others lead." }
  ]
};

export function DailyChallenge() {
  const { user } = useAuth();
  const [isCompleted, setIsCompleted] = useState(false);
  const userArchetype = user?.eq_archetype as EQArchetype | undefined || "innovator";
  
  // Get a challenge based on the user's archetype
  const getChallengeForArchetype = () => {
    const challenges = DAILY_CHALLENGES[userArchetype] || DAILY_CHALLENGES.innovator;
    // In a real app, we'd select based on user's history and progress
    const randomIndex = Math.floor(Math.random() * challenges.length);
    return challenges[randomIndex];
  };
  
  const todaysChallenge = getChallengeForArchetype();
  
  const handleComplete = () => {
    setIsCompleted(true);
    // In a real app, we'd save this to the user's profile
  };
  
  const archetype = userArchetype ? ARCHETYPES[userArchetype] : null;
  
  return (
    <div className="space-y-3">
      <h3 className="text-xs uppercase font-semibold text-muted-foreground">Daily EQ Challenge</h3>
      
      <div className={`rounded-lg p-3 border shadow-sm transition-all duration-300 ${
        isCompleted ? 'bg-humanly-teal/5 border-humanly-teal/20' : 'bg-gradient-to-br from-white to-humanly-gray-lightest border-humanly-teal/10'
      }`}>
        <div className="flex items-start gap-2 mb-2">
          {archetype && (
            <span className="text-lg" title={archetype.title}>{archetype.icon}</span>
          )}
          <div>
            <h4 className="text-sm font-medium">{todaysChallenge.title}</h4>
            <p className="text-xs text-gray-600 mt-0.5">{todaysChallenge.description}</p>
          </div>
        </div>
        
        {!isCompleted ? (
          <Button 
            onClick={handleComplete}
            size="sm"
            variant="outline" 
            className="w-full mt-2 border-humanly-teal/20 text-humanly-teal hover:bg-humanly-teal/5"
          >
            <ListCheck className="h-3.5 w-3.5 mr-1" />
            Complete Challenge
          </Button>
        ) : (
          <div className="bg-humanly-teal/10 text-humanly-teal p-2 rounded-md flex items-center justify-center gap-2 mt-2">
            <Check className="h-4 w-4" />
            <span className="text-xs font-medium">Challenge Completed!</span>
          </div>
        )}
      </div>
    </div>
  );
}
