
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MemoryStats as MemoryStatsType } from "@/hooks/useMemorySettings";

interface MemoryStatsProps {
  memoryStats: MemoryStatsType;
}

export const MemoryStatsCard = ({ memoryStats }: MemoryStatsProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Memory Statistics</CardTitle>
        <CardDescription>Overview of your conversation memory</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted p-2 rounded">
            <p className="text-xs text-muted-foreground">Total memories</p>
            <p className="text-lg font-medium">{memoryStats.totalMemories}</p>
          </div>
          <div className="bg-muted p-2 rounded">
            <p className="text-xs text-muted-foreground">Messages</p>
            <p className="text-lg font-medium">{memoryStats.messageCount}</p>
          </div>
          <div className="bg-muted p-2 rounded">
            <p className="text-xs text-muted-foreground">Insights</p>
            <p className="text-lg font-medium">{memoryStats.insightCount}</p>
          </div>
          <div className="bg-muted p-2 rounded">
            <p className="text-xs text-muted-foreground">Topics</p>
            <p className="text-lg font-medium">{memoryStats.topicCount}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
