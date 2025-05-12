
import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Trash2, RotateCw, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useChatMemory } from "@/context/ChatMemoryContext";

interface MemorySettingsProps {
  onClose?: () => void;
}

export function MemorySettings({ onClose }: MemorySettingsProps) {
  const { user } = useAuth();
  const { 
    memoryEnabled, 
    smartInsightsEnabled, 
    memoryStats,
    toggleMemory,
    toggleSmartInsights,
    refreshMemoryStats,
    clearAllMemories
  } = useChatMemory();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFree, setIsFree] = useState(true);
  const [isBasic, setIsBasic] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  // Set user tier flags
  useEffect(() => {
    if (user) {
      setIsFree(user.subscription_tier === 'free');
      setIsBasic(user.subscription_tier === 'basic');
      setIsPremium(user.subscription_tier === 'premium');
    }
  }, [user]);

  // Handle memory toggle
  const handleToggleMemory = async (checked: boolean) => {
    if (user?.subscription_tier === 'free') {
      toast.error("Memory features are not available on the free tier");
      return;
    }
    
    setIsLoading(true);
    const success = await toggleMemory(checked);
    setIsLoading(false);
    
    if (success) {
      toast.success(`Memory features ${checked ? 'enabled' : 'disabled'}`);
    } else {
      toast.error("Failed to update memory settings");
    }
  };

  // Handle smart insights toggle (premium only)
  const handleToggleSmartInsights = async (checked: boolean) => {
    if (user?.subscription_tier !== 'premium') {
      toast.error("Smart insights are a premium feature");
      return;
    }
    
    setIsLoading(true);
    const success = await toggleSmartInsights(checked);
    setIsLoading(false);
    
    if (success) {
      toast.success(`Smart insights ${checked ? 'enabled' : 'disabled'}`);
    } else {
      toast.error("Failed to update insight settings");
    }
  };

  // Handle deleting all memories
  const handleDeleteAllMemories = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    const success = await clearAllMemories();
    setIsDeleting(false);
    
    if (success) {
      toast.success("All memories have been deleted");
    } else {
      toast.error("Failed to delete memories");
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return '';
    }
  };
  
  // If free tier, show upgrade prompt
  if (isFree) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-humanly-indigo" />
            Memory Features
          </CardTitle>
          <CardDescription>
            Kai can remember your past conversations and insights to provide more personalized coaching.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center py-6">
            <div className="text-center space-y-2">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto opacity-60" />
              <h3 className="font-medium">Feature not available</h3>
              <p className="text-sm text-muted-foreground">
                Memory features are available on our Basic and Premium plans.
              </p>
              <Button 
                className="mt-4" 
                onClick={() => window.location.href = '/pricing'}
              >
                Upgrade to unlock
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-humanly-indigo" />
          Memory Settings
        </CardTitle>
        <CardDescription>
          Control how Kai remembers and utilizes your past conversations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Memory */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Enable Memory</h3>
            <p className="text-sm text-muted-foreground">
              Allow Kai to use information from your past conversations to provide more personalized coaching.
            </p>
          </div>
          <Switch checked={memoryEnabled} onCheckedChange={handleToggleMemory} />
        </div>
        
        {/* Smart Insights (Premium only) */}
        {isPremium && (
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Smart Insights</h3>
              <p className="text-sm text-muted-foreground">
                Extract and remember key insights from your conversations to enhance future coaching.
              </p>
            </div>
            <Switch checked={smartInsightsEnabled} onCheckedChange={handleToggleSmartInsights} />
          </div>
        )}
        
        {/* Memory Stats */}
        {memoryEnabled && (
          <>
            <div className="space-y-2 pt-2">
              <h3 className="font-medium">Memory Statistics</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-muted rounded-lg">
                  <div className="text-muted-foreground">Total Memories</div>
                  <div className="font-medium">{memoryStats.totalMemories}</div>
                </div>
                <div className="p-2 bg-muted rounded-lg">
                  <div className="text-muted-foreground">Insights</div>
                  <div className="font-medium">{memoryStats.insightCount}</div>
                </div>
                {isPremium && (
                  <>
                    <div className="p-2 bg-muted rounded-lg">
                      <div className="text-muted-foreground">Messages</div>
                      <div className="font-medium">{memoryStats.messageCount}</div>
                    </div>
                    <div className="p-2 bg-muted rounded-lg">
                      <div className="text-muted-foreground">Topics</div>
                      <div className="font-medium">{memoryStats.topicCount}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Memory Management */}
            <div className="space-y-2 pt-2">
              <h3 className="font-medium">Memory Management</h3>
              <p className="text-sm text-muted-foreground">
                Manage your stored conversation memories.
              </p>
              
              <div className="flex space-x-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => {
                    setIsLoading(true);
                    refreshMemoryStats().finally(() => setIsLoading(false));
                    toast.info("Refreshing memories...");
                  }}
                  disabled={isLoading}
                >
                  <RotateCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="flex-1"
                      disabled={isDeleting || memoryStats.totalMemories === 0}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear All Memories</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will delete all of Kai's memories about your past conversations.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAllMemories}>
                        Delete All
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
