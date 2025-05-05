
import { AlertCircle } from "lucide-react";

interface AuthErrorProps {
  message: string;
}

export function AuthError({ message }: AuthErrorProps) {
  return (
    <div className="bg-destructive/15 p-3 rounded-md flex items-start gap-2 text-sm">
      <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
      <p className="text-destructive">{message}</p>
    </div>
  );
}
