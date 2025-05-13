
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const { logout } = useAuth();
  
  return (
    <Button
      variant="outline"
      className="w-full justify-start text-destructive border-destructive/20 hover:bg-destructive/10"
      onClick={logout}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Log out
    </Button>
  );
}
