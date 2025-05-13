
import React, { useEffect } from "react";
import { useChatMemory } from "@/context/ChatMemoryContext";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { LoadingState } from "./components/LoadingState";
import { EmptyState } from "./components/EmptyState";
import { MemoryCard } from "./components/MemoryCard";

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
        <LoadingState />
      ) : archivedMemories.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="space-y-3 pr-4">
            {archivedMemories.map((memory) => (
              <MemoryCard 
                key={memory.id}
                memory={memory}
                onDelete={handleDeleteMemory}
                onRestore={handleRestoreMemory}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
