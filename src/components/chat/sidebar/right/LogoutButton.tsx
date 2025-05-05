
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const { logout } = useAuth();
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg border-red-100"
      onClick={logout}
    >
      <LogOut className="h-4 w-4" />
      Log out
    </Button>
  );
}
