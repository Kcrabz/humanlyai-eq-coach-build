
import { Sparkle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BreakthroughAlertProps {
  visible: boolean;
}

export function BreakthroughAlert({ visible }: BreakthroughAlertProps) {
  if (!visible) return null;
  
  return (
    <Alert className="bg-humanly-teal-light/20 border-humanly-teal animate-pulse">
      <Sparkle className="h-4 w-4 text-humanly-teal" />
      <AlertDescription className="text-sm">
        <span className="font-medium">EQ Breakthrough Detected!</span> You're making great progress.
      </AlertDescription>
    </Alert>
  );
}
