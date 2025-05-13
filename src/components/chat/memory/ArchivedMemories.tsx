import React, { useEffect } from "react";
import { useChatMemory } from "@/context/ChatMemoryContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Brain, Trash2, RefreshCw, MessageSquare, Sparkles, ArrowUpFromLine } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";

export const ArchivedMemories = () => {
  const {
    archivedMemories,
    isLoadingArchive,
    loadArchivedMemories,
    deleteArchivedMemory,
    restoreMemory
  } = useChatMemory();

  // Load archived memories on component mount
  useEffect(() => {
    loadArchivedMemories();
  }, [loadArchivedMemories]);

  // Format memory time
  const formatMemoryTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch (e) {
      return "Unknown date";
    }
  };

  // Handle memory deletion
  const handleDeleteMemory = async (id: string) => {
    const success = await deleteArchivedMemory(id);
    if (success) {
      toast("Memory deleted", {
        description: "The archived memory has been permanently deleted",
      });
    } else {
      toast.error("Failed to delete memory");
    }
  };

  // Handle memory restoration
  const handleRestoreMemory = async (memory: any) => {
    const success = await restoreMemory(memory);
    if (success) {
      toast("Memory restored", {
        description: "The memory has been restored to your active memories",
      });
    } else {
      toast.error("Failed to restore memory");
    }
  };

  // Display memory icon based on type
  const MemoryTypeIcon = ({ type }: { type: string }) => {
    switch (type) {
      case 'insight':
      case 'breakthrough':
        return <Sparkles className="h-4 w-4 text-humanly-indigo" />;
      case 'topic':
        return <Brain className="h-4 w-4 text-humanly-teal" />;
      default:
        return <MessageSquare className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Archived Memories</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => loadArchivedMemories()}
          disabled={isLoadingArchive}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingArchive ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isLoadingArchive ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-humanly-indigo"></div>
        </div>
      ) : archivedMemories.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Brain className="mx-auto h-12 w-12 text-muted-foreground/30 mb-2" />
            <p className="text-muted-foreground">No archived memories found</p>
            <p className="text-xs text-muted-foreground mt-2">
              Archived memories will appear here when you clear memories with archiving enabled
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="space-y-3 pr-4">
            {archivedMemories.map((memory) => (
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
                            onClick={() => handleRestoreMemory(memory)}
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
                            onClick={() => handleDeleteMemory(memory.id)}
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
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
