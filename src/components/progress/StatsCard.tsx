
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface StatsCardProps {
  totalSessions: number;
  challengesCompleted: number;
  currentStreak: number;
  totalMinutes: number;
}

export const StatsCard = ({ totalSessions, challengesCompleted, currentStreak, totalMinutes }: StatsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-humanly-teal" />
          Your Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center justify-center p-4 bg-humanly-teal/10 rounded-lg">
            <span className="text-2xl font-bold text-humanly-teal">{totalSessions}</span>
            <span className="text-xs text-gray-600">Sessions</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-humanly-teal/10 rounded-lg">
            <span className="text-2xl font-bold text-humanly-teal">{challengesCompleted}</span>
            <span className="text-xs text-gray-600">Challenges</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-humanly-teal/10 rounded-lg">
            <span className="text-2xl font-bold text-humanly-teal">{currentStreak}</span>
            <span className="text-xs text-gray-600">Day Streak</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-humanly-teal/10 rounded-lg">
            <span className="text-2xl font-bold text-humanly-teal">{totalMinutes}</span>
            <span className="text-xs text-gray-600">Minutes</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
