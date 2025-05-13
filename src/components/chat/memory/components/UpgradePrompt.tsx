
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export const UpgradePrompt = () => {
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
};
