
import React from "react";
import { StatsCard } from "./StatsCard";
import { ArchetypeJourneyCard } from "./ArchetypeJourneyCard";
import { DailyChallengeCard } from "./DailyChallengeCard";
import { RecentAchievementsCard } from "./RecentAchievementsCard";
import { StreakTracker } from "@/components/chat/sidebar/StreakTracker";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { EQArchetype } from "@/types";

interface OverviewTabProps {
  stats: {
    totalSessions: number;
    challengesCompleted: number;
    currentStreak: number;
    longestStreak: number;
    eq_archetype: string;
    archetypeProgress: number;
    totalMinutes: number;
    totalReflections: number;
  };
  achievements: any[];
  userArchetype: EQArchetype;
  onChallengeClick: () => void;
}

export const OverviewTab = ({ stats, achievements, userArchetype, onChallengeClick }: OverviewTabProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stats Card */}
        <StatsCard 
          totalSessions={stats.totalSessions}
          challengesCompleted={stats.challengesCompleted}
          currentStreak={stats.currentStreak}
          totalMinutes={stats.totalMinutes}
        />
        
        {/* Streak tracker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-humanly-teal" />
              Activity Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StreakTracker />
          </CardContent>
        </Card>
        
        {/* Archetype journey */}
        <ArchetypeJourneyCard 
          userArchetype={userArchetype} 
          archetypeProgress={stats.archetypeProgress}
        />
        
        {/* Current challenge */}
        <DailyChallengeCard onChallengeClick={onChallengeClick} />
      </div>
      
      {/* Recent Achievements */}
      <RecentAchievementsCard achievements={achievements} />
    </div>
  );
};
