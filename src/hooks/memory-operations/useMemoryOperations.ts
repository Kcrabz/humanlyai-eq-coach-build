
import { useCallback } from "react";
import { useMemoryToggle } from "./useMemoryToggle";
import { useMemoryArchive, ArchivedMemory } from "./useMemoryArchive";
import { useMemoryClear } from "./useMemoryClear";
import { useMemoryInsights } from "./useMemoryInsights";
import { MemoryStats } from "@/hooks/useMemorySettings";

export { ArchivedMemory };

export const useMemoryOperations = (
  setMemoryEnabled: (enabled: boolean) => void,
  setSmartInsightsEnabled: (enabled: boolean) => void,
  setMemoryStats: (stats: MemoryStats) => void,
  refreshMemoryStats: () => Promise<void>
) => {
  // Use modular hooks
  const { toggleMemory, toggleSmartInsights } = useMemoryToggle(
    setMemoryEnabled,
    setSmartInsightsEnabled
  );

  const { 
    archiveMemory,
    getArchivedMemories,
    deleteArchivedMemory,
    restoreMemory: baseRestoreMemory
  } = useMemoryArchive();

  const { clearAllMemories } = useMemoryClear(
    setMemoryStats,
    archiveMemory
  );

  const { restoreMemoryWithRefresh } = useMemoryInsights(refreshMemoryStats);

  // Compose the restore memory functionality to include refresh
  const restoreMemory = useCallback(async (archivedMemory: ArchivedMemory): Promise<boolean> => {
    const result = await baseRestoreMemory(archivedMemory);
    if (result) {
      await refreshMemoryStats();
    }
    return result;
  }, [baseRestoreMemory, refreshMemoryStats]);

  return {
    toggleMemory,
    toggleSmartInsights,
    clearAllMemories,
    archiveMemory,
    getArchivedMemories,
    deleteArchivedMemory,
    restoreMemory
  };
};
