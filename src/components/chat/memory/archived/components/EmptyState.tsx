
import React from "react";
import { Brain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const EmptyState = () => {
  return (
    <Card>
      <CardContent className="py-8 text-center">
        <Brain className="mx-auto h-12 w-12 text-muted-foreground/30 mb-2" />
        <p className="text-muted-foreground">No archived memories found</p>
        <p className="text-xs text-muted-foreground mt-2">
          Archived memories will appear here when you clear memories with archiving enabled
        </p>
      </CardContent>
    </Card>
  );
};
