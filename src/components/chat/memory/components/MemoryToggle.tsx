
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface MemoryToggleProps {
  memoryEnabled: boolean;
  onToggle: (checked: boolean) => Promise<void>;
}

export const MemoryToggle = ({ memoryEnabled, onToggle }: MemoryToggleProps) => {
  return (
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
        onCheckedChange={onToggle}
      />
    </div>
  );
};
