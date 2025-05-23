
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateAvatar } from "@/lib/utils";
import { Share2, Shield, LayoutDashboard } from "lucide-react";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { UserAvatar } from "@/components/chat/components/UserAvatar";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { isAdmin, isLoading: isAdminCheckLoading } = useAdminCheck();
  const location = useLocation();
  const isOnChatPage = location.pathname === "/chat";
  const isOnProgressPage = location.pathname === "/progress";
  const isOnDashboardPage = location.pathname === "/dashboard";
  const isMobile = useIsMobile();

  // Add logging to debug admin status on dashboard
  useEffect(() => {
    console.log("Header rendered on path:", location.pathname);
    console.log("Header admin status:", { 
      isAdmin, 
      isAdminCheckLoading, 
      userEmail: user?.email, 
      authenticated: isAuthenticated 
    });
  }, [isAdmin, isAdminCheckLoading, user, location.pathname, isAuthenticated]);

  // On mobile, we don't show the header on chat page as it's handled by CollapsibleMenu
  if (isMobile && isOnChatPage) {
    return null;
  }

  return (
    <header className="enhanced-header py-4 px-4 sm:px-6 sticky top-0 z-50 bg-white shadow-md border-b border-gray-200 header-fade-in">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 transition-transform duration-300 hover:scale-[1.02]">
          <span className="bg-gradient-to-r from-humanly-teal to-humanly-teal-light bg-clip-text text-transparent text-2xl font-bold">
            HumanlyAI
          </span>
        </Link>

        {/* Only show nav menu on non-mobile screens */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/about" className="text-sm font-medium text-foreground hover:text-humanly-teal-dark transition-colors hover:scale-105 duration-300">
            About
          </Link>
          <Link to="/pricing" className="text-sm font-medium text-foreground hover:text-humanly-teal-dark transition-colors hover:scale-105 duration-300">
            Pricing
          </Link>
          <Link to="/blog" className="text-sm font-medium text-foreground hover:text-humanly-teal-dark transition-colors hover:scale-105 duration-300">
            Blog
          </Link>
          <Link to="/help" className="text-sm font-medium text-foreground hover:text-humanly-teal-dark transition-colors hover:scale-105 duration-300">
            Help
          </Link>
          <Link to="/community" className="text-sm font-medium text-foreground hover:text-humanly-teal-dark transition-colors hover:scale-105 duration-300">
            Community
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* Dashboard Button - only show when not on dashboard page */}
              {!isOnDashboardPage && !isMobile && (
                <Link to="/dashboard">
                  <Button variant="outline" size="sm" className="rounded-lg border-humanly-teal/20 hover:bg-humanly-teal/5 transition-all duration-300">
                    <LayoutDashboard className="h-4 w-4 mr-1" />
                    Dashboard
                  </Button>
                </Link>
              )}
            
              {/* Only show "Chat with Coach" button when not on the chat page */}
              {!isOnChatPage && !isMobile && (
                <Link to="/chat">
                  <Button variant="outline" size="sm" className="rounded-lg border-humanly-teal/20 hover:bg-humanly-teal/5 transition-all duration-300">
                    Chat with Coach
                  </Button>
                </Link>
              )}
              
              {/* Only show "View Progress" button when not on the progress page */}
              {!isOnProgressPage && !isOnChatPage && !isMobile && (
                <Link to="/progress">
                  <Button variant="outline" size="sm" className="rounded-lg border-humanly-teal/20 hover:bg-humanly-teal/5 transition-all duration-300">
                    View Progress
                  </Button>
                </Link>
              )}
              
              {/* User Avatar Dropdown - The only account access point on desktop */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full transition-transform duration-300 hover:scale-110 hover:shadow-sm">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar_url || generateAvatar(user?.name || user?.email || "")} alt={user?.name || "User"} />
                      <AvatarFallback>{user?.name?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-xl shadow-soft border border-gray-100 animate-scale-fade-in" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-md transition-colors hover:bg-humanly-pastel-mint/50 cursor-pointer">
                    <Link to="/progress">Your Progress</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-md transition-colors hover:bg-humanly-pastel-mint/50 cursor-pointer">
                    <Link to="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-md transition-colors hover:bg-humanly-pastel-mint/50 cursor-pointer">
                    <Link to="/subscription">Subscription</Link>
                  </DropdownMenuItem>
                  
                  {/* Admin link - only visible for admin users */}
                  {isAdmin && (
                    <DropdownMenuItem asChild className="rounded-md transition-colors hover:bg-humanly-pastel-mint/50 cursor-pointer">
                      <Link to="/admin" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {/* Refer a Friend link */}
                  <DropdownMenuItem asChild className="rounded-md transition-colors hover:bg-humanly-pastel-mint/50 cursor-pointer">
                    <Link to="/refer" className="flex items-center gap-2">
                      <Share2 className="h-4 w-4" />
                      <span>Refer a Friend</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="rounded-md text-red-500 hover:text-red-600 transition-colors hover:bg-red-50 cursor-pointer">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              {!isMobile && (
                <>
                  <Link to="/login">
                    <Button variant="outline" size="sm" className="rounded-lg transition-all duration-300 hover:bg-humanly-pastel-blue/30 border-humanly-teal/20">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="sm" className="rounded-lg bg-gradient-to-r from-humanly-teal to-humanly-teal/90 transition-all duration-300 hover:shadow-md hover:scale-105">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
              {isMobile && (
                <Link to="/login">
                  <Button size="sm" className="rounded-lg bg-gradient-to-r from-humanly-teal to-humanly-teal/90 transition-all duration-300 hover:shadow-md hover:scale-105">
                    Sign In
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
