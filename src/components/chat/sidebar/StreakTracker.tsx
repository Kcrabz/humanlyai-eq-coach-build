
import { Calendar } from "lucide-react";
import { useState } from "react";

const DAYS_OF_WEEK = ["S", "M", "T", "W", "T", "F", "S"];

// Mock activity data - In a real app, this would come from your backend
const generateMockActivityData = () => {
  // Get the current date
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Generate last 7 days of activity
  const activityData: {date: Date; completed: boolean}[] = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth, currentDay - i);
    // Randomly decide if there was activity on this day
    // For demo purposes: make sure there's activity for last 3 days to show a streak
    const completed = i <= 2 || Math.random() > 0.3;
    activityData.push({ date, completed });
  }
  
  return activityData;
};

export function StreakTracker() {
  const [activityData] = useState(generateMockActivityData());
  
  // Calculate current streak
  const calculateStreak = () => {
    let streak = 0;
    // Start from today and go backwards
    for (let i = activityData.length - 1; i >= 0; i--) {
      if (activityData[i].completed) {
        streak++;
      } else {
        break; // Break the streak when we find a day with no activity
      }
    }
    return streak;
  };
  
  const currentStreak = calculateStreak();
  
  return (
    <div className="space-y-3">
      <h3 className="text-xs uppercase font-semibold text-muted-foreground">Your Activity</h3>
      
      <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-humanly-teal" />
            <span className="text-xs font-medium">Current streak</span>
          </div>
          <span className="text-humanly-teal font-bold text-sm">{currentStreak} days</span>
        </div>
        
        {/* Week view */}
        <div className="grid grid-cols-7 gap-1">
          {DAYS_OF_WEEK.map((day, index) => (
            <div key={day + index} className="text-center">
              <div className="text-xs text-gray-500 mb-1">{day}</div>
            </div>
          ))}
          
          {activityData.map((day, index) => (
            <div key={index} className="flex justify-center">
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  day.completed 
                    ? 'bg-humanly-teal text-white' 
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {day.date.getDate()}
              </div>
            </div>
          ))}
        </div>
        
        {currentStreak >= 3 && (
          <div className="mt-3 text-center bg-humanly-teal/10 text-humanly-teal p-2 rounded-md text-xs">
            {currentStreak >= 5 
              ? "Amazing! You're building a great EQ habit 🔥" 
              : "Great job staying consistent! Keep it up 👏"}
          </div>
        )}
      </div>
    </div>
  );
}
