
import { GraduationCap, Heart } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function ProgressTracker() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Sample progress data (in a real app, this would come from the user's profile)
  const equserProgress = {
    level: 2,
    streakDays: 5,
    completedChallenges: 7,
    nextLevel: 15,
    progress: 46
  };
  
  const handleViewProgress = () => {
    navigate("/progress");
  };
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <h3 className="text-xs uppercase font-medium text-muted-foreground">EQ Progress</h3>
      </div>
      
      <div className="p-2 rounded-lg bg-humanly-pastel-lavender/10">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <GraduationCap className="h-3 w-3 text-humanly-indigo" />
            <span className="text-xs font-medium">Level {equserProgress.level}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Heart className="h-3 w-3 text-humanly-teal" />
            <span>{equserProgress.streakDays} day streak</span>
          </div>
        </div>
        
        <Progress value={equserProgress.progress} className="h-1.5 mb-1" />
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{equserProgress.completedChallenges} completed</span>
          <span>{equserProgress.nextLevel} to next level</span>
        </div>
      </div>
    </div>
  );
}
