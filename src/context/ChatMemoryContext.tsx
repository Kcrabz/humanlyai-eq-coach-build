
import React, { createContext, useContext } from "react";
import { useMemorySettings, MemoryStats } from "@/hooks/useMemorySettings";
import { useMemoryOperations } from "@/hooks/useMemoryOperations";

interface MemoryContextType {
  memoryEnabled: boolean;
  smartInsightsEnabled: boolean;
  memoryStats: MemoryStats;
  isLoading: boolean;
  toggleMemory: (enabled: boolean) => Promise<boolean>;
  toggleSmartInsights: (enabled: boolean) => Promise<boolean>;
  refreshMemoryStats: () => Promise<void>;
  clearAllMemories: () => Promise<boolean>;
}

const ChatMemoryContext = createContext<MemoryContextType | undefined>(undefined);

export const ChatMemoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    clearAllMemories
  } = useMemoryOperations(
    setMemoryEnabled,
    setSmartInsightsEnabled,
    setMemoryStats,
    refreshMemoryStats
  );

  return (
    <ChatMemoryContext.Provider
      value={{
        memoryEnabled,
        smartInsightsEnabled,
        memoryStats,
        isLoading,
        toggleMemory,
        toggleSmartInsights,
        refreshMemoryStats,
        clearAllMemories
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
