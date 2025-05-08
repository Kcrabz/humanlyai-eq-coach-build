
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Trophy, Calendar, MessageCircle, Award, Flag } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface TimelineItem {
  date: string;
  title: string;
  description: string;
  icon: string;
  isCurrent?: boolean;
  progress?: number;
}

interface GrowthTimelineCardProps {
  timelineItems: TimelineItem[];
}

export const GrowthTimelineCard = ({ timelineItems }: GrowthTimelineCardProps) => {
  // Helper function to render the appropriate icon
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "Calendar":
        return <Calendar className="h-4 w-4" />;
      case "MessageCircle":
        return <MessageCircle className="h-4 w-4" />;
      case "Award":
        return <Award className="h-4 w-4" />;
      case "Flag":
        return <Flag className="h-4 w-4" />;
      default:
        return <Trophy className="h-4 w-4" />;
    }
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-humanly-teal" />
          Growth Timeline
        </CardTitle>
        <CardDescription>
          Your EQ development over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative pt-2">
          {/* Timeline elements */}
          <div className="absolute top-0 bottom-0 left-4 w-[2px] bg-gray-200"></div>
          
          <div className="space-y-8">
            {timelineItems.map((item, index) => (
              <div key={index} className="relative pl-10">
                <div className={`absolute left-0 top-1 h-8 w-8 rounded-full ${item.isCurrent ? 'bg-amber-500' : 'bg-humanly-teal'} flex items-center justify-center text-white transition-all duration-300 hover:scale-110`}>
                  {renderIcon(item.icon)}
                </div>
                <div className={`bg-white border ${item.isCurrent ? 'border-amber-200' : 'border-gray-100'} rounded-lg p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-humanly-pastel-lavender/50`}>
                  <p className="text-xs text-gray-500 mb-1">{item.date}</p>
                  <h3 className="font-medium text-base">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.description}
                  </p>
                  {item.isCurrent && item.progress !== undefined && (
                    <div className="mt-3 transition-all duration-500">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium">Progress</span>
                        <span className="text-xs font-medium">{item.progress}%</span>
                      </div>
                      <Progress value={item.progress} className="h-2 transition-all duration-1000" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
