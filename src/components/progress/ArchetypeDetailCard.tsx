
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Check, Flag } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { EQArchetype } from "@/types";
import { ARCHETYPES } from "@/lib/constants";

interface ArchetypeDetailCardProps {
  userArchetype: EQArchetype;
}

export const ArchetypeDetailCard = ({ userArchetype }: ArchetypeDetailCardProps) => {
  const archetype = ARCHETYPES[userArchetype];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {archetype && (
            <span className="text-lg" title={archetype.title}>{archetype.icon}</span>
          )}
          Your Archetype
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <h3 className="text-xl font-medium text-humanly-teal">{archetype?.title || "Innovator"}</h3>
          <p className="text-sm text-muted-foreground mt-1">{archetype?.description || "Your description"}</p>
        </div>
        
        <Separator />
        
        <div>
          <h4 className="text-sm font-medium mb-2">Your strengths:</h4>
          <ul className="text-sm space-y-2">
            {archetype?.strengths.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <Separator />
        
        <div>
          <h4 className="text-sm font-medium mb-2">Growth areas:</h4>
          <ul className="text-sm space-y-2">
            {archetype?.growthAreas.map((area, idx) => (
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
};
