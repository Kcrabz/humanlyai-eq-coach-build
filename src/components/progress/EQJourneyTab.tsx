
import React from "react";
import { ArchetypeDetailCard } from "./ArchetypeDetailCard";
import { GrowthTimelineCard } from "./GrowthTimelineCard";
import { EQArchetype } from "@/types";

interface EQJourneyTabProps {
  userArchetype: EQArchetype;
  timelineItems: any[];
}

export const EQJourneyTab = ({ userArchetype, timelineItems }: EQJourneyTabProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
      <div className="md:col-span-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
        <ArchetypeDetailCard userArchetype={userArchetype} />
      </div>
      
      <div className="md:col-span-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
        <GrowthTimelineCard timelineItems={timelineItems} />
      </div>
    </div>
  );
};
