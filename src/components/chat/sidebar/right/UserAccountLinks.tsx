
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, CreditCard, Settings } from "lucide-react";

export function UserAccountLinks() {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-1">
      <h4 className="text-xs font-medium text-muted-foreground px-2 py-1">Your Account</h4>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 rounded-lg"
        onClick={() => navigate("/settings")}
      >
        <User className="h-4 w-4" />
        Your Bio
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 rounded-lg"
        onClick={() => navigate("/subscription")}
      >
        <CreditCard className="h-4 w-4" />
        Your Plan
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 rounded-lg"
        onClick={() => navigate("/settings")}
      >
        <Settings className="h-4 w-4" />
        Settings
      </Button>
    </div>
  );
}
