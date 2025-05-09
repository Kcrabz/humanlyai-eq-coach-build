
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
          <TooltipContent>
            <p>Total time spent chatting, based on {user.message_count || 0} messages</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return "No activity";
};
