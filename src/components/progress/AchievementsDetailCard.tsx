
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Award, MessageCircle, Calendar, Star } from "lucide-react";

interface Achievement {
  id: number;
  name: string;
  description: string;
  date: string;
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
      case "Award":
      default:
        return <Award className="h-6 w-6" />;
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
                <h3 className="font-medium">{achievement.name}</h3>
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
                <p className="text-xs text-gray-500 mt-1">Earned on {achievement.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
