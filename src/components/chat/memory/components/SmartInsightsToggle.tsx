
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SmartInsightsToggleProps {
  smartInsightsEnabled: boolean;
  onToggle: (checked: boolean) => Promise<void>;
  isPremium: boolean;
}

export const SmartInsightsToggle = ({ 
  smartInsightsEnabled, 
  onToggle, 
  isPremium 
}: SmartInsightsToggleProps) => {
  return (
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
        onCheckedChange={onToggle}
        disabled={!isPremium}
      />
    </div>
  );
};
