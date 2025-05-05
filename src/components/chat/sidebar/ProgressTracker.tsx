
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Award, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";

// This would ideally be fetched from an API based on user's interaction history
const MOCK_PROGRESS_DATA = {
  overallProgress: 65,
  sessionsCompleted: 12,
  streakDays: 5,
  badges: ["active-listener", "emotion-master", "first-insight"]
};

export function ProgressTracker() {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState(MOCK_PROGRESS_DATA);
  
  // We'd normally fetch this data from an API
  useEffect(() => {
    // In a real implementation, we'd make an API call here
    // For now, we'll just simulate the data
    const timer = setTimeout(() => {
      setProgressData({
        ...MOCK_PROGRESS_DATA,
        // Add a small random variation to make it feel dynamic
        overallProgress: Math.min(100, MOCK_PROGRESS_DATA.overallProgress + Math.floor(Math.random() * 5))
      });
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [user]);

  const getBadgeIcon = (badgeId: string) => {
    switch(badgeId) {
      case "active-listener":
        return <Star className="h-3 w-3" />;
      case "emotion-master": 
        return <Award className="h-3 w-3" />;
      case "first-insight":
        return <TrendingUp className="h-3 w-3" />;
      default:
        return <Star className="h-3 w-3" />;
    }
  };

  const getBadgeName = (badgeId: string) => {
    switch(badgeId) {
      case "active-listener": return "Active Listener";
      case "emotion-master": return "Emotion Master";
      case "first-insight": return "First Insight";
      default: return badgeId;
    }
  };
  
  return (
    <div className="space-y-3">
      <h3 className="text-xs uppercase font-semibold text-muted-foreground">Your EQ Journey</h3>
      
      <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium">Overall EQ Progress</span>
          <span className="text-xs font-bold text-humanly-teal">{progressData.overallProgress}%</span>
        </div>
        
        <Progress 
          value={progressData.overallProgress} 
          className="h-2 mb-3"
        />
        
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-humanly-teal" />
            <span>{progressData.sessionsCompleted} sessions</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Award className="h-3 w-3 text-humanly-teal" />
            <span>{progressData.streakDays} day streak</span>
          </div>
        </div>
        
        {/* Badges section */}
        <div className="mt-3 border-t pt-2 border-gray-100">
          <p className="text-xs font-medium mb-2">Recent achievements</p>
          <div className="flex gap-1">
            {progressData.badges.slice(0, 3).map((badge) => (
              <div 
                key={badge} 
                className="bg-humanly-teal/10 text-humanly-teal p-1 rounded-md flex items-center gap-1"
                title={getBadgeName(badge)}
              >
                {getBadgeIcon(badge)}
                <span className="text-xs font-medium">{getBadgeName(badge)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
