import React, { createContext, useContext, useState } from "react";
import { useMemorySettings, MemoryStats } from "@/hooks/useMemorySettings";
import { useMemoryOperations, ArchivedMemory } from "@/hooks/memory-operations";

interface MemoryContextType {
  memoryEnabled: boolean;
  smartInsightsEnabled: boolean;
  memoryStats: MemoryStats;
  isLoading: boolean;
  archivedMemories: ArchivedMemory[];
  isLoadingArchive: boolean;
  toggleMemory: (enabled: boolean) => Promise<boolean>;
  toggleSmartInsights: (enabled: boolean) => Promise<boolean>;
  refreshMemoryStats: () => Promise<void>;
  clearAllMemories: (shouldArchive?: boolean) => Promise<boolean>;
  loadArchivedMemories: () => Promise<void>;
  deleteArchivedMemory: (memoryId: string) => Promise<boolean>;
  restoreMemory: (archivedMemory: ArchivedMemory) => Promise<boolean>;
}

const ChatMemoryContext = createContext<MemoryContextType | undefined>(undefined);

export const ChatMemoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [archivedMemories, setArchivedMemories] = useState<ArchivedMemory[]>([]);
  const [isLoadingArchive, setIsLoadingArchive] = useState<boolean>(false);

  const {
    memoryEnabled,
    setMemoryEnabled,
    smartInsightsEnabled,
    setSmartInsightsEnabled,
    memoryStats,
    setMemoryStats,
    isLoading,
    refreshMemoryStats
  } = useMemorySettings();

  const {
    toggleMemory,
    toggleSmartInsights,
    clearAllMemories: clearMemories,
    getArchivedMemories,
    deleteArchivedMemory,
    restoreMemory
  } = useMemoryOperations(
    setMemoryEnabled,
    setSmartInsightsEnabled,
    setMemoryStats,
    refreshMemoryStats
  );

  // Load archived memories
  const loadArchivedMemories = async () => {
    setIsLoadingArchive(true);
    try {
      const memories = await getArchivedMemories();
      setArchivedMemories(memories);
    } catch (error) {
      console.error("Error loading archived memories:", error);
    } finally {
      setIsLoadingArchive(false);
    }
  };

  // Wrapper for clear memories with archiving option
  const handleClearAllMemories = async (shouldArchive: boolean = false) => {
    const result = await clearMemories(shouldArchive);
    if (result && shouldArchive) {
      // Refresh archived memories after archiving
      await loadArchivedMemories();
    }
    return result;
  };

  // Wrapper for delete archived memory
  const handleDeleteArchivedMemory = async (memoryId: string) => {
    const result = await deleteArchivedMemory(memoryId);
    if (result) {
      // Update local state after deletion
      setArchivedMemories(prevMemories => 
        prevMemories.filter(memory => memory.id !== memoryId)
      );
    }
    return result;
  };

  // Wrapper for restore memory
  const handleRestoreMemory = async (archivedMemory: ArchivedMemory) => {
    const result = await restoreMemory(archivedMemory);
    if (result) {
      // Remove from archived memories after successful restoration
      setArchivedMemories(prevMemories => 
        prevMemories.filter(memory => memory.id !== archivedMemory.id)
      );
    }
    return result;
  };

  return (
    <ChatMemoryContext.Provider
      value={{
        memoryEnabled,
        smartInsightsEnabled,
        memoryStats,
        isLoading,
        archivedMemories,
        isLoadingArchive,
        toggleMemory,
        toggleSmartInsights,
        refreshMemoryStats,
        clearAllMemories: handleClearAllMemories,
        loadArchivedMemories,
        deleteArchivedMemory: handleDeleteArchivedMemory,
        restoreMemory: handleRestoreMemory
      }}
    >
      {children}
    </ChatMemoryContext.Provider>
  );
};

export const useChatMemory = () => {
  const context = useContext(ChatMemoryContext);
  if (!context) {
    throw new Error("useChatMemory must be used within ChatMemoryProvider");
  }
  return context;
};
