
import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { SessionActionsProps } from "./types";

export const SessionActions: React.FC<SessionActionsProps> = ({
  onTerminateAll,
  isTerminating,
  hasOtherSessions
}) => {
  if (!hasOtherSessions) {
    return null;
  }
  
  return (
    <Button
      variant="outline"
      className="w-full mt-4"
      onClick={onTerminateAll}
      disabled={isTerminating}
    >
      {isTerminating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Terminating...
        </>
      ) : (
        <>
          <LogOut className="h-4 w-4 mr-2" />
          Terminate All Other Sessions
        </>
      )}
    </Button>
  );
};
