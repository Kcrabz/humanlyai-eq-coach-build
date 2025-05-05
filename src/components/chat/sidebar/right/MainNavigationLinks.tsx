
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Info, DollarSign } from "lucide-react";

export function MainNavigationLinks() {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-1 mb-4">
      <h4 className="text-xs font-medium text-muted-foreground px-2 py-1">Main Navigation</h4>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 rounded-lg"
        onClick={() => navigate("/")}
      >
        <Home className="h-4 w-4" />
        Home
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 rounded-lg"
        onClick={() => navigate("/about")}
      >
        <Info className="h-4 w-4" />
        About
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 rounded-lg"
        onClick={() => navigate("/pricing")}
      >
        <DollarSign className="h-4 w-4" />
        Pricing
      </Button>
    </div>
  );
}
