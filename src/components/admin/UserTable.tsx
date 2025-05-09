
import { SubscriptionTier } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserOperations } from "./user-operations";
import { UserTableData } from "@/hooks/useUserManagement/types";
import { Skeleton } from "@/components/ui/skeleton";
import { InfoIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface UserTableProps {
  users: UserTableData[];
  isLoading: boolean;
  onUpdateTier: (userId: string, tier: SubscriptionTier) => Promise<void>;
  onUserDeleted?: (userId: string) => void;
}

export const UserTable = ({ users, isLoading, onUpdateTier, onUserDeleted }: UserTableProps) => {
  // Helper to determine the style for the subscription badge
  const getBadgeVariant = (tier?: string) => {
    switch (tier) {
      case "premium": return "default";
      case "basic": return "outline";
      case "trial": return "secondary";
      default: return "secondary"; // free tier or undefined
    }
  };

  const renderLastLoginCell = (user: UserTableData) => {
    if (isLoading) {
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
  
  const renderChatActivityCell = (user: UserTableData) => {
    if (isLoading) {
      return <Skeleton className="h-4 w-20" />;
    }
    
    if (user.chat_time) {
      const isFreeTier = user.chat_time.includes('free tier');
      
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className={`flex items-center ${isFreeTier ? 'text-amber-500' : ''}`}>
              <span>{user.chat_time}</span>
              {user.message_count > 0 && !isFreeTier && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {user.message_count} msg
                </Badge>
              )}
              {isFreeTier && <InfoIcon className="ml-1 h-3 w-3" />}
            </TooltipTrigger>
            <TooltipContent>
              {isFreeTier ? 
                <p>Free tier users don't have chat data stored in the database</p> : 
                <p>Total time spent chatting, based on {user.message_count} messages</p>}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    return "No activity";
  };
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Subscription</TableHead>
            <TableHead>Archetype</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead>Chat Activity</TableHead>
            <TableHead>Onboarded</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array(5).fill(0).map((_, index) => (
              <TableRow key={`loading-${index}`}>
                <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
              </TableRow>
            ))
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-6">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map(user => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>{user.name || "-"}</TableCell>
                <TableCell>
                  <Badge 
                    variant={getBadgeVariant(user.subscription_tier)}
                  >
                    {user.subscription_tier || "free"}
                  </Badge>
                </TableCell>
                <TableCell>{user.eq_archetype || "Not set"}</TableCell>
                <TableCell>{renderLastLoginCell(user)}</TableCell>
                <TableCell>{renderChatActivityCell(user)}</TableCell>
                <TableCell>{user.onboarded ? "Yes" : "No"}</TableCell>
                <TableCell>
                  <UserOperations 
                    user={user} 
                    onUpdateTier={onUpdateTier}
                    onUserDeleted={onUserDeleted}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
