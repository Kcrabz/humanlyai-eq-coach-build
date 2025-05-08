
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useEQProgress } from "@/hooks/useEQProgress";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Sparkle } from "lucide-react";

export function ProgressTracker() {
  const { isPremiumMember, userStreakData } = useAuth();
  const { totalBreakthroughs, breakthroughsByCategory } = useEQProgress();
  
  // If not a premium member, show upgrade prompt
  if (!isPremiumMember) {
    return (
      <Card className="border-dashed border-gray-300 bg-gray-50">
        <CardContent className="p-3">
          <div className="flex flex-col items-center text-center gap-1.5">
            <Sparkle className="h-7 w-7 text-humanly-teal opacity-60" />
            <h3 className="font-medium text-sm">Premium Feature</h3>
            <p className="text-xs text-muted-foreground">
              Upgrade to track EQ progress, record streaks, and unlock achievements
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-1 text-xs bg-humanly-teal text-white hover:bg-humanly-teal-dark"
              onClick={() => window.location.href = "/pricing"}
            >
              Upgrade
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // For premium members, show real streak data if available
  if (userStreakData) {
    return (
      <Card className="bg-white">
        <CardContent className="p-3">
          <h3 className="font-medium text-sm mb-2">Your Progress</h3>
          
          <div className="space-y-3">
            {/* Current streak */}
            <div>
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-xs">Current streak</span>
                <span className="text-xs font-medium">{userStreakData.currentStreak} days</span>
              </div>
              <Progress value={(userStreakData.currentStreak / Math.max(userStreakData.longestStreak, 7)) * 100} className="h-1.5" />
            </div>
            
            {/* Longest streak */}
            <div className="flex justify-between items-center text-xs">
              <span>Longest streak</span>
              <span className="font-medium">{userStreakData.longestStreak} days</span>
            </div>
            
            {/* Total practice days */}
            <div className="flex justify-between items-center text-xs">
              <span>Total practice days</span>
              <span className="font-medium">{userStreakData.totalActiveDays} days</span>
            </div>
            
            {/* EQ Breakthroughs */}
            <div className="flex justify-between items-center text-xs">
              <span>EQ Breakthroughs</span>
              <span className="font-medium">{totalBreakthroughs || 0}</span>
            </div>
            
            {/* Breakthrough categories */}
            {Object.keys(breakthroughsByCategory || {}).length > 0 && (
              <div className="mt-1">
                <p className="text-xs mb-0.5">Top EQ Areas:</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(breakthroughsByCategory)
                    .sort(([, countA], [, countB]) => countB - countA)
                    .slice(0, 3)
                    .map(([category, count]) => (
                      <span
                        key={category}
                        className="text-[10px] px-1.5 py-0.5 bg-humanly-teal/10 text-humanly-teal rounded-full"
                      >
                        {category} ({count})
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // For premium users without streak data yet
  return (
    <Card className="bg-white">
      <CardContent className="p-3">
        <h3 className="font-medium text-sm mb-2">Your Progress</h3>
        <p className="text-xs text-muted-foreground">
          Start chatting to track your EQ progress and streak!
        </p>
      </CardContent>
    </Card>
  );
}
