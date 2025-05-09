
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UserTableCellProps } from "../types";

export const TokenUsageCell = ({ user }: UserTableCellProps) => {
  if (!user) {
    return <Skeleton className="h-4 w-20" />;
  }
  
  if (!user.tokenUsage && user.tokenUsage !== 0) {
    return (
      <span className="text-muted-foreground">No data</span>
    );
  }
  
  // Display token usage with percentage if limit is available
  if (user.tokenUsageLimit) {
    const usagePercentage = Math.round((user.tokenUsage / user.tokenUsageLimit) * 100);
    const usageColor = usagePercentage > 90 ? 'text-red-500' : 
                      usagePercentage > 70 ? 'text-amber-500' : 
                      'text-green-500';
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="flex items-center">
            <span>{user.tokenUsage.toLocaleString()}</span>
            <span className={`ml-2 ${usageColor}`}>({usagePercentage}%)</span>
            {user.tokenUsage === 0 && user.message_count > 0 && (
              <span className="ml-2 text-amber-500 text-xs">!</span>
            )}
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>{user.tokenUsage.toLocaleString()} / {user.tokenUsageLimit.toLocaleString()} tokens used this month</p>
            {user.tokenUsage === 0 && user.message_count > 0 && (
              <p className="text-amber-500 text-xs mt-1">
                Missing token usage data. Possible issues with logging or user on a free plan.
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // Just display the token count if no limit is available
  return (
    <span>{user.tokenUsage.toLocaleString()}</span>
  );
};
