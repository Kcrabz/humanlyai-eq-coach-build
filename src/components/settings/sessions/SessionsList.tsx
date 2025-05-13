
import React from "react";
import { Loader2 } from "lucide-react";
import { SessionCard } from "./SessionCard";
import { SessionsListProps } from "./types";

export const SessionsList: React.FC<SessionsListProps> = ({
  sessions,
  terminatingSession,
  onTerminateSession,
  loading
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (sessions.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-4">
        No active sessions found
      </p>
    );
  }
  
  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <SessionCard 
          key={session.id}
          session={session}
          onTerminate={onTerminateSession}
          isTerminating={terminatingSession === session.id}
        />
      ))}
    </div>
  );
};
