
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Flag, Check, Clock } from "lucide-react";
import { ChallengeHistoryItem } from "@/hooks/useChallenges";
import { Skeleton } from "@/components/ui/skeleton";

interface ChallengeHistoryCardProps {
  challenges: ChallengeHistoryItem[];
  isLoading?: boolean;
}

export const ChallengeHistoryCard = ({ challenges, isLoading = false }: ChallengeHistoryCardProps) => {
  return (
    <Card className="transition-all duration-300 hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flag className="h-5 w-5 text-humanly-teal" />
          Challenge History
        </CardTitle>
        <CardDescription>
          View your previous daily challenges
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : challenges.length > 0 ? (
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <div 
                key={challenge.id} 
                className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-humanly-pastel-lavender/50"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                    challenge.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {challenge.completed ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">{challenge.title || challenge.name}</h3>
                    <p className="text-xs text-gray-500">{challenge.date}</p>
                  </div>
                </div>
                {challenge.completed && (
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full transition-all duration-300 hover:bg-green-200">
                    Completed
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No challenge history found. Complete your first challenge to see it here!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
