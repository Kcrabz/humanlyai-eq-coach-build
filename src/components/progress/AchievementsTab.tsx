
import React, { useState, useEffect } from "react";
import { AchievementsDetailCard } from "./AchievementsDetailCard";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface AchievementsTabProps {
  achievements: any[];
}

export const AchievementsTab = ({ achievements }: AchievementsTabProps) => {
  const { userAchievements } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Short timeout to ensure we have the latest data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <Card className="p-6">
          <Skeleton className="h-8 w-64 mb-4" />
          <div className="space-y-4">
            <div className="flex gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-56" />
                <Skeleton className="h-4 w-72" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }
  
  // Use either passed achievements or user achievements from auth context
  const displayedAchievements = achievements.length > 0 ? 
    achievements : 
    (userAchievements?.filter(a => a.achieved) || []);
    
  return (
    <div className="animate-fade-in">
      <AchievementsDetailCard achievements={displayedAchievements} />
    </div>
  );
};
