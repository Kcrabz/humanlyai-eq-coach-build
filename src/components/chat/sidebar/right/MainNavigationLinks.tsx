
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Shield, LayoutDashboard } from "lucide-react";
import { useEffect } from "react";

export function MainNavigationLinks() {
  const location = useLocation();
  const { isAdmin, isLoading: isAdminCheckLoading } = useAdminCheck();
  const { user } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;
  
  // Add logging to debug admin status in sidebar
  useEffect(() => {
    console.log("Sidebar navigation rendered:", {
      isAdmin,
      isAdminCheckLoading,
      userEmail: user?.email,
      path: location.pathname
    });
  }, [isAdmin, isAdminCheckLoading, user, location.pathname]);

  return (
    <div className="space-y-1">
      <Button
        variant={isActive("/") ? "default" : "ghost"}
        className="w-full justify-start"
        size="sm"
        asChild
      >
        <Link to="/">
          Home
        </Link>
      </Button>

      <Button
        variant={isActive("/dashboard") ? "default" : "ghost"}
        className="w-full justify-start"
        size="sm"
        asChild
      >
        <Link to="/dashboard" className="flex items-center gap-2">
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Dashboard
        </Link>
      </Button>

      <Button
        variant={isActive("/chat") ? "default" : "ghost"}
        className="w-full justify-start"
        size="sm"
        asChild
      >
        <Link to="/chat">
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
          Progress
        </Link>
      </Button>
      
      <Button
        variant={isActive("/blog") ? "default" : "ghost"}
        className="w-full justify-start"
        size="sm"
        asChild
      >
        <Link to="/blog">
          Blog
        </Link>
      </Button>
      
      <Button
        variant={isActive("/help") ? "default" : "ghost"}
        className="w-full justify-start"
        size="sm"
        asChild
      >
        <Link to="/help">
          Help
        </Link>
      </Button>
      
      <Button
        variant={isActive("/community") ? "default" : "ghost"}
        className="w-full justify-start"
        size="sm"
        asChild
      >
        <Link to="/community">
          Community
        </Link>
      </Button>

      <Button
        variant={isActive("/settings") ? "default" : "ghost"}
        className="w-full justify-start"
        size="sm"
        asChild
      >
        <Link to="/settings">
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
          <Link to="/admin" className="flex items-center gap-2">
            <Shield className="h-4 w-4 mr-2" />
            Admin
          </Link>
        </Button>
      )}
    </div>
  );
}
