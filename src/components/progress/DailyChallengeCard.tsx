
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { DailyChallenge } from "@/components/chat/sidebar/DailyChallenge";

interface DailyChallengeCardProps {
  onChallengeClick: () => void;
}

export const DailyChallengeCard = ({ onChallengeClick }: DailyChallengeCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-humanly-teal" />
          Today's Challenge
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DailyChallenge standaloneMode={true} onChallengeClick={onChallengeClick} />
      </CardContent>
    </Card>
  );
};
