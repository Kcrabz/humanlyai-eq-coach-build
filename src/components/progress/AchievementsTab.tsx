
import React from "react";
import { AchievementsDetailCard } from "./AchievementsDetailCard";

interface AchievementsTabProps {
  achievements: any[];
}

export const AchievementsTab = ({ achievements }: AchievementsTabProps) => {
  return (
    <div className="animate-fade-in">
      <AchievementsDetailCard achievements={achievements} />
    </div>
  );
};
