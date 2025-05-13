
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Check, Flag, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { EQArchetype } from "@/types";
import { ARCHETYPES } from "@/lib/constants";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ArchetypeJourneyCardProps {
  userArchetype: EQArchetype;
  archetypeProgress: number;
}

export const ArchetypeJourneyCard = ({ userArchetype, archetypeProgress }: ArchetypeJourneyCardProps) => {
  const archetype = ARCHETYPES[userArchetype];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {archetype && (
            <span className="text-lg" title={archetype.title}>{archetype.icon}</span>
          )}
          Your Archetype Journey
        </CardTitle>
        <CardDescription>
          {archetype?.description || "Discover your EQ archetype"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium flex items-center gap-1">
              Growth progress
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px] p-4">
                    <div className="space-y-2 text-sm">
                      <p><strong>Growth progress is calculated from:</strong></p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li><strong>Daily activity</strong> - Logging in and interacting daily</li>
                        <li><strong>Challenges completed</strong> - Completing daily EQ challenges</li>
                        <li><strong>Breakthroughs</strong> - Emotional insights Kai detects in your chats</li>
                        <li><strong>Achievements</strong> - Unlocking badges and milestones</li>
                      </ul>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
            <span className="text-sm font-medium">{archetypeProgress}%</span>
          </div>
          <Progress value={archetypeProgress} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Your strengths:</h4>
          <ul className="text-sm space-y-1">
            {archetype?.strengths.slice(0, 2).map((strength, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Growth areas:</h4>
          <ul className="text-sm space-y-1">
            {archetype?.growthAreas.slice(0, 2).map((area, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Flag className="h-4 w-4 text-amber-500 mt-0.5" />
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
