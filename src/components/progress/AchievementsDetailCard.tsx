
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Award, MessageCircle, Calendar, Star, Trophy, Flag, Lightbulb } from "lucide-react";

interface Achievement {
  id: number | string;
  name?: string;
  title?: string;
  description: string;
  date?: string;
  achievedAt?: string;
  icon: string;
}

interface AchievementsDetailCardProps {
  achievements: Achievement[];
}

export const AchievementsDetailCard = ({ achievements }: AchievementsDetailCardProps) => {
  // Helper function to render the appropriate icon
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "MessageCircle":
        return <MessageCircle className="h-6 w-6" />;
      case "Calendar":
        return <Calendar className="h-6 w-6" />;
      case "Star":
        return <Star className="h-6 w-6" />;
      case "Trophy":
        return <Trophy className="h-6 w-6" />;
      case "Flag":
        return <Flag className="h-6 w-6" />;
      case "Lightbulb":
        return <Lightbulb className="h-6 w-6" />;
      case "Award":
      default:
        return <Award className="h-6 w-6" />;
    }
  };

  // Format date string
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently earned";
    
    try {
      if (typeof dateString === 'string' && dateString.includes('/')) {
        return dateString; // Already formatted
      }
      
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch (e) {
      return "Recently earned";
    }
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-humanly-teal" />
          Your Achievements
        </CardTitle>
        <CardDescription>
          Track your growth and milestones in emotional intelligence
        </CardDescription>
      </CardHeader>
      <CardContent>
        {achievements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-medium">No achievements yet</p>
            <p className="text-sm mt-2">
              Continue using the app and completing challenges to earn achievements
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className="flex items-start gap-4 p-4 bg-white border border-gray-100 rounded-lg shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-humanly-pastel-lavender/50"
              >
                <div className="h-12 w-12 rounded-full bg-humanly-teal/10 text-humanly-teal flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:scale-110">
                  {renderIcon(achievement.icon)}
                </div>
                <div>
                  <h3 className="font-medium">{achievement.name || achievement.title}</h3>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Earned on {formatDate(achievement.date || achievement.achievedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
