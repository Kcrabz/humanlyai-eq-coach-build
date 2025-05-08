
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ClipboardCheck } from "lucide-react";

interface EQAssessmentAlertProps {
  onStartAssessment: () => void;
}

export function EQAssessmentAlert({ onStartAssessment }: EQAssessmentAlertProps) {
  return (
    <Alert className="m-4 bg-humanly-pastel-lavender/20 border-humanly-indigo/30 rounded-xl shadow-soft">
      <ClipboardCheck className="h-4 w-4 text-humanly-indigo" />
      <AlertDescription className="text-sm">
        For more personalized coaching, consider{" "}
        <Button variant="link" size="sm" className="p-0 h-auto text-humanly-indigo hover:text-humanly-indigo-dark underline decoration-humanly-indigo/30" onClick={onStartAssessment}>
          completing your EQ assessment
        </Button>
      </AlertDescription>
    </Alert>
  );
}
