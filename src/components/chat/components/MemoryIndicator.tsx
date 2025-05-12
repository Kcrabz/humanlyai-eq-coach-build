
import React from "react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { Brain, Sparkles, MessageSquare } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

interface MemoryIndicatorProps {
  hasMemories?: boolean;
  memoryStats?: {
    count: number;
    topicCount: number;
    insightCount: number;
  };
  className?: string;
}

export function MemoryIndicator({ hasMemories = false, memoryStats, className = "" }: MemoryIndicatorProps) {
  const { user } = useAuth();
  
  // Free users don't have memory features
  if (!user || user.subscription_tier === 'free') {
    return null;
  }
  
  // If no memories are available for this message
  if (!hasMemories) {
    return null;
  }
  
  // Format memory counts for display
  const totalCount = memoryStats?.count || 0;
  const insightCount = memoryStats?.insightCount || 0;
  const messageCount = totalCount - insightCount - (memoryStats?.topicCount || 0);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-2 ${className}`}>
            <Badge variant="outline" className="bg-gradient-to-r from-humanly-indigo/10 to-humanly-teal/10 text-xs py-1 px-2 flex items-center gap-1">
              <Brain className="h-3 w-3 text-humanly-teal" />
              <span>Memory</span>
            </Badge>
            
            {/* Show memory type indicators for premium users */}
            {user.subscription_tier === 'premium' && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {insightCount > 0 && (
                  <span className="flex items-center gap-0.5">
                    <Sparkles className="h-3 w-3 text-humanly-indigo" />
                    {insightCount}
                  </span>
                )}
                {messageCount > 0 && (
                  <span className="flex items-center gap-0.5">
                    <MessageSquare className="h-3 w-3 text-slate-500" />
                    {messageCount}
                  </span>
                )}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Kai is using information from your previous conversations to provide more personalized coaching.</p>
          {user.subscription_tier === 'premium' && (
            <div className="text-xs mt-1 text-muted-foreground">
              <p>Drawing on {totalCount} relevant memories</p>
              {insightCount > 0 && <p>{insightCount} insights/breakthroughs</p>}
              {messageCount > 0 && <p>{messageCount} previous messages</p>}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
