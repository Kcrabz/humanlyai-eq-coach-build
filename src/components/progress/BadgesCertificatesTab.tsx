
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Certificate } from "lucide-react";

interface BadgeOrCertificate {
  id: string;
  type: "badge" | "certificate";
  name: string;
  description: string;
  dateEarned: string;
  category: string;
}

interface BadgesCertificatesTabProps {
  badges: BadgeOrCertificate[];
}

export const BadgesCertificatesTab = ({ badges }: BadgesCertificatesTabProps) => {
  // Group badges by category
  const groupedByCategory = badges.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, BadgeOrCertificate[]>);

  // Render badge item
  const renderBadgeItem = (item: BadgeOrCertificate) => {
    return (
      <div 
        key={item.id}
        className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-humanly-pastel-lavender/50 text-center"
      >
        <div className="mb-3 relative">
          <div className="h-16 w-16 rounded-full flex items-center justify-center bg-humanly-teal/10 text-humanly-teal transition-transform duration-300 hover:scale-110 mb-2">
            {item.type === "badge" ? (
              <Trophy className="h-8 w-8" />
            ) : (
              <Certificate className="h-8 w-8" />
            )}
          </div>
          {item.type === "badge" && (
            <Badge className="absolute -top-1 -right-1 bg-humanly-indigo">Badge</Badge>
          )}
          {item.type === "certificate" && (
            <Badge className="absolute -top-1 -right-1 bg-humanly-teal">Certificate</Badge>
          )}
        </div>
        <h3 className="font-medium text-base mb-1">{item.name}</h3>
        <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
        <span className="text-xs text-gray-500">Earned on {item.dateEarned}</span>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {Object.entries(groupedByCategory).map(([category, items]) => (
        <Card key={category} className="transition-all duration-300 hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-humanly-teal" />
              {category}
            </CardTitle>
            <CardDescription>
              You've earned {items.length} {items.length === 1 ? "credential" : "credentials"} in this category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map(renderBadgeItem)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
