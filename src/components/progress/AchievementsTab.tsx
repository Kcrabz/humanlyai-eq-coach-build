
import React from "react";
import { AchievementsDetailCard } from "./AchievementsDetailCard";

interface AchievementsTabProps {
  achievements: any[];
}

export const AchievementsTab = ({ achievements }: AchievementsTabProps) => {
  return <AchievementsDetailCard achievements={achievements} />;
};
