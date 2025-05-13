import { GraduationCap, Heart } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProgressData {
  level: number;
  streakDays: number;
  completedChallenges: number;
  nextLevel: number;
  progress: number;
}

export function ProgressTracker() {
  const { user, userStreakData } = useAuth();
  const navigate = useNavigate();
  const [progressData, setProgressData] = useState<ProgressData>({
    level: 1,
    streakDays: 0,
    completedChallenges: 0,
    nextLevel: 15,
    progress: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserProgress = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Fetch achieved challenges count
        const { count: achievedCount, error: achievedError } = await supabase
          .from('user_achievements')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('achieved', true);
        
        if (achievedError) throw achievedError;
        
        // Fetch total chat interactions to calculate level
        const { count: chatCount, error: chatError } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        if (chatError) throw chatError;
        
        // Calculate level based on chat count
        // Level 1: 0-10 messages
        // Level 2: 11-30 messages
        // Level 3: 31-60 messages
        // etc.
        const level = chatCount ? Math.max(1, Math.floor(Math.sqrt(chatCount) / 2)) : 1;
        
        // Calculate progress to next level
        const currentLevelThreshold = Math.pow((level * 2), 2);
        const nextLevelThreshold = Math.pow(((level + 1) * 2), 2);
        const range = nextLevelThreshold - currentLevelThreshold;
        const progressInRange = chatCount - currentLevelThreshold;
        const progressPercentage = Math.min(100, Math.max(0, Math.round((progressInRange / range) * 100)));
        
        // Points needed for next level
        const pointsForNextLevel = nextLevelThreshold - chatCount;
        
        setProgressData({
          level: level,
          streakDays: userStreakData?.currentStreak || 0,
          completedChallenges: achievedCount || 0,
          nextLevel: Math.max(1, pointsForNextLevel),
          progress: progressPercentage
        });
        
      } catch (error) {
        console.error("Error fetching progress data:", error);
        // Keep default values on error
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProgress();
  }, [user?.id, userStreakData]);
  
  const handleViewProgress = () => {
    navigate("/progress");
  };
  
  if (isLoading) return null; // Don't render until data is loaded
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <h3 className="text-xs uppercase font-medium text-muted-foreground">EQ Progress</h3>
      </div>
      
      <div className="p-2 rounded-lg bg-humanly-pastel-lavender/10">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <GraduationCap className="h-3 w-3 text-humanly-indigo" />
            <span className="text-xs font-medium">Level {progressData.level}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Heart className="h-3 w-3 text-humanly-teal" />
            <span>{progressData.streakDays} day streak</span>
          </div>
        </div>
        
        <Progress value={progressData.progress} className="h-1.5 mb-1" />
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{progressData.completedChallenges} completed</span>
          <span>{progressData.nextLevel} to next level</span>
        </div>
      </div>
    </div>
  );
}
