
import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Laptop, Smartphone, Loader2 } from "lucide-react";
import { SessionCardProps } from "./types";

export const SessionCard: React.FC<SessionCardProps> = ({ 
  session, 
  onTerminate, 
  isTerminating 
}) => {
  const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    
    if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
      return <Smartphone className="h-4 w-4" />;
    }
    
    return <Laptop className="h-4 w-4" />;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div 
      className={`flex items-center justify-between p-3 border rounded-lg ${
        session.is_current ? "bg-primary/5" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        {getDeviceIcon(session.user_agent)}
        <div>
          <p className="font-medium">
            {session.is_current && (
              <span className="text-humanly-teal mr-1">Current •</span>
            )}
            {session.user_agent.split(" ")[0]}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDate(session.created_at)}
          </p>
        </div>
      </div>
      
      {!session.is_current && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onTerminate(session.id)}
          disabled={isTerminating}
        >
          {isTerminating ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <LogOut className="h-3 w-3 mr-1" />
          )}
          Terminate
        </Button>
      )}
    </div>
  );
};
