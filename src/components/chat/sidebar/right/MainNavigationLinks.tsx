
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

export function MainNavigationLinks() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="space-y-3">
      <Button
        variant={isActive("/") ? "secondary" : "ghost"}
        className="w-full justify-start px-4 py-2 h-10"
        asChild
      >
        <Link to="/">
          Home
        </Link>
      </Button>

      <Button
        variant={isActive("/chat") ? "secondary" : "ghost"}
        className="w-full justify-start px-4 py-2 h-10 bg-humanly-indigo/10 text-humanly-indigo"
        asChild
      >
        <Link to="/chat">
          Chat
        </Link>
      </Button>
      
      <Button
        variant={isActive("/progress") ? "secondary" : "ghost"}
        className="w-full justify-start px-4 py-2 h-10 bg-humanly-teal/10"
        asChild
      >
        <Link to="/progress">
          Progress
        </Link>
      </Button>
      
      <Button
        variant={isActive("/blog") ? "secondary" : "ghost"}
        className="w-full justify-start px-4 py-2 h-10"
        asChild
      >
        <Link to="/blog">
          Blog
        </Link>
      </Button>
      
      <Button
        variant={isActive("/help") ? "secondary" : "ghost"}
        className="w-full justify-start px-4 py-2 h-10"
        asChild
      >
        <Link to="/help">
          Help
        </Link>
      </Button>
      
      <Button
        variant={isActive("/community") ? "secondary" : "ghost"}
        className="w-full justify-start px-4 py-2 h-10"
        asChild
      >
        <Link to="/community">
          Community
        </Link>
      </Button>
    </div>
  );
}
