
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Home, MessageCircle, Settings, LayoutGrid, TrendingUp } from "lucide-react";
import { useAdminCheck } from "@/hooks/useAdminCheck";

export function MainNavigationLinks() {
  const location = useLocation();
  const { isAdmin } = useAdminCheck();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className="space-y-1">
      <Button
        variant={isActive("/") ? "default" : "ghost"}
        className="w-full justify-start"
        size="sm"
        asChild
      >
        <Link to="/">
          <Home className="mr-2 h-4 w-4" />
          Home
        </Link>
      </Button>

      <Button
        variant={isActive("/chat") ? "default" : "ghost"}
        className="w-full justify-start"
        size="sm"
        asChild
      >
        <Link to="/chat">
          <MessageCircle className="mr-2 h-4 w-4" />
          Chat
        </Link>
      </Button>
      
      <Button
        variant={isActive("/progress") ? "default" : "ghost"}
        className="w-full justify-start bg-humanly-teal/10"
        size="sm"
        asChild
      >
        <Link to="/progress">
          <TrendingUp className="mr-2 h-4 w-4" />
          Progress
        </Link>
      </Button>

      <Button
        variant={isActive("/settings") ? "default" : "ghost"}
        className="w-full justify-start"
        size="sm"
        asChild
      >
        <Link to="/settings">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Link>
      </Button>
      
      {/* Admin link - only shown to admin users */}
      {isAdmin && (
        <Button
          variant={isActive("/admin") ? "default" : "ghost"}
          className="w-full justify-start"
          size="sm"
          asChild
        >
          <Link to="/admin">
            <LayoutGrid className="mr-2 h-4 w-4" />
            Admin
          </Link>
        </Button>
      )}
    </div>
  );
}
