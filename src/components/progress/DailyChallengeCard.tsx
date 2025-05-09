
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChallenges } from "@/hooks/useChallenges";
import { Skeleton } from "@/components/ui/skeleton";

interface DailyChallengeCardProps {
  onChallengeClick: () => void;
}

export const DailyChallengeCard = ({ onChallengeClick }: DailyChallengeCardProps) => {
  const { todaysChallenge, isChallengeCompleted, completeChallenge, isLoading } = useChallenges();

  const handleStartChallenge = () => {
    onChallengeClick();
    if (!isChallengeCompleted) {
      completeChallenge();
    }
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-humanly-teal animate-pulse-soft" />
          Today's Challenge
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full mt-4" />
          </div>
        ) : todaysChallenge ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">{todaysChallenge.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {todaysChallenge.description}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleStartChallenge}
                className={`w-full ${
                  isChallengeCompleted 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-humanly-teal hover:bg-humanly-teal/90'
                }`}
              >
                {isChallengeCompleted ? (
                  <>
                    <Check className="mr-2 h-4 w-4" /> 
                    Completed - Try Again
                  </>
                ) : (
                  'Start Challenge'
                )}
              </Button>
              {isChallengeCompleted && (
                <p className="text-xs text-center text-green-600">
                  Great job completing today's challenge!
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Unable to load today's challenge.</p>
        )}
      </CardContent>
    </Card>
  );
};
