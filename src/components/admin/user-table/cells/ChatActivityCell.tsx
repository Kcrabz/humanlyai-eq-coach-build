
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UserTableCellProps } from "../types";

export const ChatActivityCell = ({ user }: UserTableCellProps) => {
  if (!user) {
    return <Skeleton className="h-4 w-20" />;
  }
  
  if (user.chat_time) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="flex items-center">
            <span>{user.chat_time}</span>
            {user.message_count > 0 && (
              <Badge variant="outline" className="ml-2 text-xs">
                {user.message_count} msg
              </Badge>
            )}
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>Total time spent chatting, based on {user.message_count || 0} messages</p>
            {user.message_count > 0 && user.tokenUsage === 0 && (
              <p className="text-amber-500 text-xs mt-1">
                User has chat activity but no token usage logged for this month
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return "No activity";
};
