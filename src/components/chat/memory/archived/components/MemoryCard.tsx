
import React from "react";
import { format } from "date-fns";
import { ArrowUpFromLine, Trash2 } from "lucide-react";
import { MemoryTypeIcon } from "./MemoryTypeIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

interface MemoryCardProps {
  memory: {
    id: string;
    content: string;
    memory_type: string;
    archived_at: string;
    metadata?: any;
  };
  onDelete: (id: string) => void;
  onRestore: (memory: any) => void;
}

export const MemoryCard = ({ memory, onDelete, onRestore }: MemoryCardProps) => {
  // Format memory time
  const formatMemoryTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch (e) {
      return "Unknown date";
    }
  };

  return (
    <Card key={memory.id} className="group">
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="flex items-center gap-1">
            <MemoryTypeIcon type={memory.memory_type} />
            <span className="capitalize">{memory.memory_type}</span>
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatMemoryTime(memory.archived_at)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="py-2">
        <p className="text-sm">{memory.content}</p>
        
        <div className="mt-3 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onRestore(memory)}
                >
                  <ArrowUpFromLine className="h-4 w-4 mr-2" />
                  Restore
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Restore this memory</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => onDelete(memory.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Permanently delete</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
};
