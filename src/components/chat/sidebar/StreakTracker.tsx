
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function StreakTracker() {
  const { user, userStreakData } = useAuth();
  const [days, setDays] = useState<{ day: string; isActive: boolean; date: Date }[]>([]);
  
  // Initialize or update streak on component mount
  useEffect(() => {
    const updateStreak = async () => {
      if (user?.id) {
        try {
          await supabase.functions.invoke('increment-streak', {
            body: { user_id: user.id }
          });
        } catch (error) {
          console.error("Error updating streak:", error);
        }
      }
    };
    
    updateStreak();
  }, [user?.id]);
  
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
          // Convert dates to YYYY-MM-DD format for comparison
          const dateStr = date.toISOString().split('T')[0];
          const lastActiveDateStr = lastActiveDate.toISOString().split('T')[0];
          
          // If this is today and today is the last active date
          if (i === 0) {
            isActive = lastActiveDateStr === dateStr;
          } else {
            // For previous days, they're active if they're within the streak range
            // Calculate how many days ago this day was
            const dayDiff = i;
            // Day is active if it's within current streak days
            isActive = dayDiff < (userStreakData?.currentStreak || 0);
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
  
  console.log("Streak data in component:", userStreakData);
  
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
