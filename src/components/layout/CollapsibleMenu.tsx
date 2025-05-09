
import { useState } from "react";
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
import { Menu, X, Shield, Share2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useIsMobile } from "@/hooks/use-mobile";

export function CollapsibleMenu() {
  const { user, isAuthenticated, logout } = useAuth();
  const { isAdmin } = useAdminCheck();
  const location = useLocation();
  const isMobile = useIsMobile();
  const isOnChatPage = location.pathname === "/chat";
  const isOnProgressPage = location.pathname === "/progress";
  const isOnDashboardPage = location.pathname === "/dashboard";
  const [isOpen, setIsOpen] = useState(false);

  // Don't render this menu on the chat page on mobile devices
  // as the chat page has its own right sidebar for mobile
  if (isMobile && isOnChatPage) {
    return null;
  }

  // Handle menu item click - closes the menu
  const handleMenuItemClick = () => {
    setIsOpen(false);
  };

  return (
    <div className={`fixed top-0 right-0 z-50 w-full ${isOnChatPage ? 'mobile-chat-menu' : ''}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        {/* Repositioned toggle button - moved to the right and visible on all screens */}
        <div className="absolute top-4 right-4 z-[100]">
          <CollapsibleTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-humanly-teal/10"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent className="mt-2 enhanced-header animate-slide-up">
          <div className="container mx-auto py-4 px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <Link 
                to="/" 
                className="flex items-center gap-2 transition-transform duration-300 hover:scale-[1.02] mb-4 md:mb-0"
                onClick={handleMenuItemClick}
              >
                <span className="bg-gradient-to-r from-humanly-teal to-humanly-teal-light bg-clip-text text-transparent text-2xl font-bold">
                  HumanlyAI
                </span>
              </Link>

              {/* Mobile-optimized menu navigation */}
              <nav className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-4 md:mb-0">
                <Link 
                  to="/about" 
                  className="text-sm font-medium text-foreground hover:text-humanly-teal-dark transition-colors py-2 md:py-0 border-b md:border-b-0 border-gray-100"
                  onClick={handleMenuItemClick}
                >
                  About
                </Link>
                <Link 
                  to="/pricing" 
                  className="text-sm font-medium text-foreground hover:text-humanly-teal-dark transition-colors py-2 md:py-0 border-b md:border-b-0 border-gray-100"
                  onClick={handleMenuItemClick}
                >
                  Pricing
                </Link>
                <Link 
                  to="/blog" 
                  className="text-sm font-medium text-foreground hover:text-humanly-teal-dark transition-colors py-2 md:py-0 border-b md:border-b-0 border-gray-100"
                  onClick={handleMenuItemClick}
                >
                  Blog
                </Link>
                <Link 
                  to="/help" 
                  className="text-sm font-medium text-foreground hover:text-humanly-teal-dark transition-colors py-2 md:py-0 border-b md:border-b-0 border-gray-100"
                  onClick={handleMenuItemClick}
                >
                  Help
                </Link>
                <Link 
                  to="/community" 
                  className="text-sm font-medium text-foreground hover:text-humanly-teal-dark transition-colors py-2 md:py-0 border-b md:border-b-0 border-gray-100"
                  onClick={handleMenuItemClick}
                >
                  Community
                </Link>
              </nav>

              {/* Auth-based actions */}
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                {isAuthenticated ? (
                  <>
                    {/* Dashboard Button */}
                    {!isOnDashboardPage && (
                      <Link 
                        to="/dashboard"
                        onClick={handleMenuItemClick}
                        className="w-full md:w-auto"
                      >
                        <Button variant="outline" size="sm" className="rounded-lg border-humanly-teal/20 hover:bg-humanly-teal/5 transition-all duration-300 w-full md:w-auto">
                          Dashboard
                        </Button>
                      </Link>
                    )}
                    
                    {/* Chat with Coach button */}
                    {!isOnChatPage && (
                      <Link 
                        to="/chat"
                        onClick={handleMenuItemClick}
                        className="w-full md:w-auto"
                      >
                        <Button variant="outline" size="sm" className="rounded-lg border-humanly-teal/20 hover:bg-humanly-teal/5 transition-all duration-300 w-full md:w-auto">
                          Chat with Coach
                        </Button>
                      </Link>
                    )}
                    
                    {/* View Progress button */}
                    {!isOnProgressPage && !isOnChatPage && (
                      <Link 
                        to="/progress"
                        onClick={handleMenuItemClick}
                        className="w-full md:w-auto"
                      >
                        <Button variant="outline" size="sm" className="rounded-lg border-humanly-teal/20 hover:bg-humanly-teal/5 transition-all duration-300 w-full md:w-auto">
                          View Progress
                        </Button>
                      </Link>
                    )}
                    
                    {/* User profile - Show avatar on desktop instead of "Account" text button */}
                    <div className="mt-4 md:mt-0">
                      {/* Mobile avatar and user info */}
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 md:hidden">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.avatar_url || generateAvatar(user?.name || user?.email || "")} alt={user?.name || "User"} />
                          <AvatarFallback>{user?.name?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user?.name || "User"}</p>
                          <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                      </div>
                      
                      {/* Desktop avatar dropdown - replaces "Account" text button */}
                      <div className="hidden md:block">
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
                              <Link to="/progress" onClick={handleMenuItemClick}>Your Progress</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="rounded-md transition-colors hover:bg-humanly-pastel-mint/50 cursor-pointer">
                              <Link to="/settings" onClick={handleMenuItemClick}>Settings</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="rounded-md transition-colors hover:bg-humanly-pastel-mint/50 cursor-pointer">
                              <Link to="/subscription" onClick={handleMenuItemClick}>Subscription</Link>
                            </DropdownMenuItem>
                            
                            {/* Admin link - only visible for admin users */}
                            {isAdmin && (
                              <DropdownMenuItem asChild className="rounded-md transition-colors hover:bg-humanly-pastel-mint/50 cursor-pointer">
                                <Link to="/admin" onClick={handleMenuItemClick} className="flex items-center gap-2">
                                  <Shield className="h-4 w-4" />
                                  <span>Admin Dashboard</span>
                                </Link>
                              </DropdownMenuItem>
                            )}
                            
                            {/* Refer a Friend link */}
                            <DropdownMenuItem asChild className="rounded-md transition-colors hover:bg-humanly-pastel-mint/50 cursor-pointer">
                              <Link to="/refer" onClick={handleMenuItemClick} className="flex items-center gap-2">
                                <Share2 className="h-4 w-4" />
                                <span>Refer a Friend</span>
                              </Link>
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => {
                                logout();
                                handleMenuItemClick();
                              }} 
                              className="rounded-md text-red-500 hover:text-red-600 transition-colors hover:bg-red-50 cursor-pointer"
                            >
                              Log out
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    {/* Settings and user options - Mobile Only */}
                    <div className="flex flex-col w-full mt-4 md:hidden">
                      <Link 
                        to="/progress"
                        onClick={handleMenuItemClick}
                        className="p-3 text-sm hover:bg-gray-100 rounded-md"
                      >
                        Your Progress
                      </Link>
                      <Link 
                        to="/settings"
                        onClick={handleMenuItemClick}
                        className="p-3 text-sm hover:bg-gray-100 rounded-md"
                      >
                        Settings
                      </Link>
                      <Link 
                        to="/subscription"
                        onClick={handleMenuItemClick}
                        className="p-3 text-sm hover:bg-gray-100 rounded-md"
                      >
                        Subscription
                      </Link>
                      
                      {/* Admin link - only visible for admin users */}
                      {isAdmin && (
                        <Link 
                          to="/admin" 
                          onClick={handleMenuItemClick}
                          className="p-3 text-sm hover:bg-gray-100 rounded-md flex items-center gap-2"
                        >
                          <Shield className="h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                      
                      {/* Refer a Friend link */}
                      <Link 
                        to="/refer" 
                        onClick={handleMenuItemClick}
                        className="p-3 text-sm hover:bg-gray-100 rounded-md flex items-center gap-2"
                      >
                        <Share2 className="h-4 w-4" />
                        <span>Refer a Friend</span>
                      </Link>
                      
                      <button 
                        onClick={() => {
                          logout();
                          handleMenuItemClick();
                        }}
                        className="p-3 text-sm text-left text-red-500 hover:bg-red-50 rounded-md mt-2"
                      >
                        Log out
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login"
                      onClick={handleMenuItemClick}
                      className="w-full md:w-auto"
                    >
                      <Button variant="outline" size="sm" className="rounded-lg transition-all duration-300 hover:bg-humanly-pastel-blue/30 border-humanly-teal/20 w-full md:w-auto">
                        Sign In
                      </Button>
                    </Link>
                    <Link 
                      to="/signup"
                      onClick={handleMenuItemClick}
                      className="w-full md:w-auto"
                    >
                      <Button size="sm" className="rounded-lg bg-gradient-to-r from-humanly-teal to-humanly-teal/90 transition-all duration-300 hover:shadow-md hover:scale-105 w-full md:w-auto">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

