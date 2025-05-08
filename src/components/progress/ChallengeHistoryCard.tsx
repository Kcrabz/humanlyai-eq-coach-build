
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Flag, Check, Clock } from "lucide-react";

interface Challenge {
  id: number;
  title?: string;
  name?: string;
  completed: boolean;
  date: string;
}

interface ChallengeHistoryCardProps {
  challenges: Challenge[];
}

export const ChallengeHistoryCard = ({ challenges }: ChallengeHistoryCardProps) => {
  return (
    <Card>
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
        <div className="space-y-4">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
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
                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                  Completed
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
