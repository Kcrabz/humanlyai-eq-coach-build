
import { useState } from "react";
import { InfoIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UserTableCellProps } from "../types";

export const LastLoginCell = ({ user }: UserTableCellProps) => {
  if (!user) {
    return <Skeleton className="h-4 w-20" />;
  }
  
  if (!user.last_login) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="flex items-center text-amber-500">
            <span>No login data</span>
            <InfoIcon className="ml-1 h-3 w-3" />
          </TooltipTrigger>
          <TooltipContent>
            <p>User account exists but no login has been recorded yet.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // Check if this is a creation date rather than login
  const isCreationDate = typeof user.last_login === 'string' && user.last_login.includes('Created');
  
  // If we have a timestamp object with relative and full timestamp
  if (typeof user.last_login === 'object' && user.last_login.timestamp) {
    const timestamp = new Date(user.last_login.timestamp);
    const formattedDate = timestamp.toLocaleDateString();
    const formattedTime = timestamp.toLocaleTimeString();
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="flex items-center">
            <span>{user.last_login.relative}</span>
            <InfoIcon className="ml-1 h-3 w-3" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs font-medium">{formattedDate} at {formattedTime}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // Fallback for string-only data
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className={`flex items-center ${isCreationDate ? 'text-amber-500' : ''}`}>
          <span>{typeof user.last_login === 'string' ? user.last_login : 'Unknown'}</span>
          {isCreationDate && <InfoIcon className="ml-1 h-3 w-3" />}
        </TooltipTrigger>
        <TooltipContent>
          <p>{isCreationDate ? 
            "No explicit login detected, showing account creation date" : 
            "Last time user logged in"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
