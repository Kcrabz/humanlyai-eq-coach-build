
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Award, MessageCircle, Calendar, Star } from "lucide-react";

interface Achievement {
  id: number;
  name: string;
  description: string;
  date: string;
  icon: string;
}

interface RecentAchievementsCardProps {
  achievements: Achievement[];
}

export const RecentAchievementsCard = ({ achievements }: RecentAchievementsCardProps) => {
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
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-humanly-teal" />
          Recent Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {achievements.slice(0, 4).map((achievement) => (
            <div key={achievement.id} className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm text-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-humanly-teal/10 text-humanly-teal flex items-center justify-center mx-auto">
                {renderIcon(achievement.icon)}
              </div>
              <h3 className="font-medium text-sm">{achievement.name}</h3>
              <p className="text-xs text-muted-foreground">{achievement.date}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
