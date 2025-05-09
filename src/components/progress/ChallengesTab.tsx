
import React from "react";
import { DailyChallengeCard } from "./DailyChallengeCard";
import { ChallengeHistoryCard } from "./ChallengeHistoryCard";
import { useChallenges } from "@/hooks/useChallenges";

interface ChallengesTabProps {
  onChallengeClick: () => void;
}

export const ChallengesTab = ({ onChallengeClick }: ChallengesTabProps) => {
  const { pastChallenges, isLoading } = useChallenges();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
      <div className="md:col-span-1 transition-all duration-300 hover:-translate-y-1">
        <DailyChallengeCard onChallengeClick={onChallengeClick} />
      </div>
      
      <div className="md:col-span-2 transition-all duration-300 hover:-translate-y-1">
        <ChallengeHistoryCard challenges={pastChallenges} isLoading={isLoading} />
      </div>
    </div>
  );
};
