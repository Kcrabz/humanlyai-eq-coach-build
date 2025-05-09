
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

export function MainNavigationLinks() {
  const location = useLocation();
  
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
    </div>
  );
}
