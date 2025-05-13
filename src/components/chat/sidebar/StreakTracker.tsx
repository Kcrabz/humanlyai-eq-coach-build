
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

export function StreakTracker() {
  const { userStreakData } = useAuth();
  const [days, setDays] = useState<{ day: string; isActive: boolean; date: Date }[]>([]);
  
  useEffect(() => {
    const generateDays = () => {
      const today = new Date();
      const lastActiveDate = userStreakData?.lastActiveDate 
        ? new Date(userStreakData.lastActiveDate)
        : null;
      
      const result = [];
      
      // Generate the last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        
        // Check if this day is part of the active streak
        let isActive = false;
        
        if (lastActiveDate) {
          // If today or yesterday was active
          if (i === 0) {
            // Today is active if it's the last active date
            isActive = lastActiveDate.setHours(0, 0, 0, 0) === date.setHours(0, 0, 0, 0);
          } else {
            // Previous days are active if they're part of the streak
            const dayDiff = Math.round((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
            isActive = dayDiff < userStreakData?.currentStreak;
          }
        }
        
        result.push({
          day: date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
          isActive,
          date
        });
      }
      
      return result;
    };
    
    setDays(generateDays());
  }, [userStreakData]);
  
  return (
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground flex justify-between items-center">
        <span>Current streak: {userStreakData?.currentStreak || 0} days</span>
        <span className="text-xs">Best: {userStreakData?.longestStreak || 0}</span>
      </div>
      
      <div className="flex justify-between">
        {days.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-xs text-muted-foreground">{day.day}</span>
            {day.isActive ? (
              <CheckCircle2 className="h-6 w-6 text-humanly-teal fill-humanly-teal/30" />
            ) : (
              <Circle className={cn(
                "h-6 w-6",
                day.date.getDate() === new Date().getDate()
                  ? "text-humanly-teal/60"
                  : "text-gray-200"
              )} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
