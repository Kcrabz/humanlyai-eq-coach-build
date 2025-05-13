
import React, { useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { useChatMemory } from "@/context/ChatMemoryContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArchivedMemories } from "./ArchivedMemories";
import {
  MemoryToggle,
  SmartInsightsToggle,
  MemoryStatsCard,
  MemoryClearActions,
  UpgradePrompt,
  LoadingState
} from "./components";

export const MemorySettings = () => {
  const { user } = useAuth();
  const {
    memoryEnabled,
    smartInsightsEnabled,
    memoryStats,
    isLoading,
    toggleMemory,
    toggleSmartInsights,
    refreshMemoryStats,
    clearAllMemories
  } = useChatMemory();

  // Determine if user is on premium plan
  const isPremium = user?.subscription_tier === 'premium';
  
  // Load memory stats on component mount
  useEffect(() => {
    if (user && user.subscription_tier !== 'free') {
      refreshMemoryStats();
    }
  }, [user, refreshMemoryStats]);

  // Handle memory toggle
  const handleMemoryToggle = async (checked: boolean) => {
    const success = await toggleMemory(checked);
    if (success) {
      toast(checked ? "Memory enabled" : "Memory disabled");
    } else {
      toast.error("Failed to update memory settings");
    }
  };

  // Handle smart insights toggle
  const handleInsightsToggle = async (checked: boolean) => {
    const success = await toggleSmartInsights(checked);
    if (success) {
      toast(checked ? "Smart insights enabled" : "Smart insights disabled");
    } else {
      toast.error("Failed to update smart insights settings");
    }
  };

  // Handle memory clearing
  const handleClearMemories = async (shouldArchive: boolean) => {
    const success = await clearAllMemories(shouldArchive);
    if (success) {
      toast("Memories cleared", {
        description: shouldArchive ? "All memories have been archived and cleared" : "All memories cleared",
      });
    } else {
      toast.error("Failed to clear memories");
    }
  };

  // If user is on free plan, show upgrade message
  if (user?.subscription_tier === 'free') {
    return <UpgradePrompt />;
  }

  // Show loading state
  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <Tabs defaultValue="settings">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsTrigger value="archive">Archive</TabsTrigger>
      </TabsList>
      
      <TabsContent value="settings" className="space-y-6 mt-4">
        {/* Memory toggle section */}
        <MemoryToggle
          memoryEnabled={memoryEnabled}
          onToggle={handleMemoryToggle}
        />

        <Separator />

        {/* Smart Insights toggle (Premium only) */}
        <SmartInsightsToggle
          smartInsightsEnabled={smartInsightsEnabled}
          onToggle={handleInsightsToggle}
          isPremium={isPremium}
        />

        <Separator />

        {/* Memory stats and clear actions */}
        {memoryEnabled && (
          <>
            <MemoryStatsCard memoryStats={memoryStats} />
            <MemoryClearActions onClearMemories={handleClearMemories} />
          </>
        )}
      </TabsContent>
      
      <TabsContent value="archive" className="mt-4">
        <ArchivedMemories />
      </TabsContent>
    </Tabs>
  );
};
