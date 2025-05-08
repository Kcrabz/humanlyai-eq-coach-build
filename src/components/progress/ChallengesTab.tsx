
import React from "react";
import { DailyChallengeCard } from "./DailyChallengeCard";
import { ChallengeHistoryCard } from "./ChallengeHistoryCard";

interface ChallengesTabProps {
  challenges: any[];
  onChallengeClick: () => void;
}

export const ChallengesTab = ({ challenges, onChallengeClick }: ChallengesTabProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <DailyChallengeCard onChallengeClick={onChallengeClick} />
      </div>
      
      <div className="md:col-span-2">
        <ChallengeHistoryCard challenges={challenges} />
      </div>
    </div>
  );
};
