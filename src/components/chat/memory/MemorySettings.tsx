
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, AlertCircle, Archive } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useChatMemory } from "@/context/ChatMemoryContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArchivedMemories } from "./ArchivedMemories";

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
      toast({
        title: checked ? "Memory enabled" : "Memory disabled",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update memory settings",
        variant: "destructive"
      });
    }
  };

  // Handle smart insights toggle
  const handleInsightsToggle = async (checked: boolean) => {
    const success = await toggleSmartInsights(checked);
    if (success) {
      toast({
        title: checked ? "Smart insights enabled" : "Smart insights disabled",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update smart insights settings",
        variant: "destructive"
      });
    }
  };

  // Handle memory clearing
  const handleClearMemories = async (shouldArchive: boolean) => {
    const success = await clearAllMemories(shouldArchive);
    if (success) {
      toast({
        title: "Memories cleared",
        description: shouldArchive ? "All memories have been archived and cleared" : "All memories cleared",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to clear memories",
        variant: "destructive"
      });
    }
  };

  // If user is on free plan, show upgrade message
  if (user?.subscription_tier === 'free') {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Memory features unavailable</h3>
        <p className="text-sm text-muted-foreground text-center mb-4">
          Upgrade to Basic or Premium to enable conversation memory and insights.
        </p>
        <Button className="w-full" onClick={() => window.location.href = "/pricing"}>
          Upgrade Now
        </Button>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-muted-foreground">Loading memory settings...</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="settings">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsTrigger value="archive">Archive</TabsTrigger>
      </TabsList>
      
      <TabsContent value="settings" className="space-y-6 mt-4">
        {/* Memory toggle section */}
        <div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="memory-toggle">Conversation Memory</Label>
              <p className="text-sm text-muted-foreground">
                Allow Kai to remember your previous conversations
              </p>
            </div>
            <Switch 
              id="memory-toggle"
              checked={memoryEnabled}
              onCheckedChange={handleMemoryToggle}
            />
          </div>
        </div>

        <Separator />

        {/* Smart Insights toggle (Premium only) */}
        <div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="insights-toggle">Smart Insights</Label>
              <p className="text-sm text-muted-foreground">
                {isPremium 
                  ? "Enable advanced analysis of conversation patterns"
                  : "Upgrade to Premium to enable this feature"}
              </p>
            </div>
            <Switch 
              id="insights-toggle"
              checked={smartInsightsEnabled}
              onCheckedChange={handleInsightsToggle}
              disabled={!isPremium}
            />
          </div>
        </div>

        <Separator />

        {/* Memory stats card */}
        {memoryEnabled && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Memory Statistics</CardTitle>
              <CardDescription>Overview of your conversation memory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted p-2 rounded">
                  <p className="text-xs text-muted-foreground">Total memories</p>
                  <p className="text-lg font-medium">{memoryStats.totalMemories}</p>
                </div>
                <div className="bg-muted p-2 rounded">
                  <p className="text-xs text-muted-foreground">Messages</p>
                  <p className="text-lg font-medium">{memoryStats.messageCount}</p>
                </div>
                <div className="bg-muted p-2 rounded">
                  <p className="text-xs text-muted-foreground">Insights</p>
                  <p className="text-lg font-medium">{memoryStats.insightCount}</p>
                </div>
                <div className="bg-muted p-2 rounded">
                  <p className="text-xs text-muted-foreground">Topics</p>
                  <p className="text-lg font-medium">{memoryStats.topicCount}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      <Archive className="h-4 w-4 mr-2" />
                      Archive & Clear
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Archive and clear all memories?</DialogTitle>
                      <DialogDescription>
                        This will archive your memories and then clear them. You can access archived memories later.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => {}}>Cancel</Button>
                      <Button 
                        variant="default"
                        onClick={() => handleClearMemories(true)}
                      >
                        Archive & Clear
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="w-full">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Only
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Clear all memories?</DialogTitle>
                      <DialogDescription>
                        This will permanently delete all conversation memories without archiving and cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => {}}>Cancel</Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleClearMemories(false)}
                      >
                        Delete All Memories
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>
      
      <TabsContent value="archive" className="mt-4">
        <ArchivedMemories />
      </TabsContent>
    </Tabs>
  );
};
