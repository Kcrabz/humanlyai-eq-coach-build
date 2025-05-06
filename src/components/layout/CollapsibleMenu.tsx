
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
import { Menu } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function CollapsibleMenu() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const isOnChatPage = location.pathname === "/chat";
  const isOnProgressPage = location.pathname === "/progress";
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-4 right-4 z-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-auto">
        <CollapsibleTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-humanly-teal/10"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-2 bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-gray-200 p-4 w-64 animate-slide-up">
          <div className="flex flex-col gap-2">
            <Link 
              to="/" 
              className="mb-4 flex items-center gap-2 transition-transform duration-300 hover:scale-[1.02]"
              onClick={() => setIsOpen(false)}
            >
              <span className="bg-gradient-to-r from-humanly-teal to-humanly-teal-light bg-clip-text text-transparent text-xl font-bold">
                HumanlyAI
              </span>
            </Link>
            
            <div className="space-y-1 mb-4">
              <Link 
                to="/about" 
                className="block p-2 text-sm font-medium text-foreground hover:text-humanly-teal-dark hover:bg-humanly-teal/5 rounded-md transition-colors duration-300"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/pricing" 
                className="block p-2 text-sm font-medium text-foreground hover:text-humanly-teal-dark hover:bg-humanly-teal/5 rounded-md transition-colors duration-300"
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                to="/blog" 
                className="block p-2 text-sm font-medium text-foreground hover:text-humanly-teal-dark hover:bg-humanly-teal/5 rounded-md transition-colors duration-300"
                onClick={() => setIsOpen(false)}
              >
                Blog
              </Link>
              <Link 
                to="/help" 
                className="block p-2 text-sm font-medium text-foreground hover:text-humanly-teal-dark hover:bg-humanly-teal/5 rounded-md transition-colors duration-300"
                onClick={() => setIsOpen(false)}
              >
                Help
              </Link>
              <Link 
                to="/community" 
                className="block p-2 text-sm font-medium text-foreground hover:text-humanly-teal-dark hover:bg-humanly-teal/5 rounded-md transition-colors duration-300"
                onClick={() => setIsOpen(false)}
              >
                Community
              </Link>
            </div>
            
            <div className="pt-2 border-t border-gray-100">
              {isAuthenticated ? (
                <div className="space-y-2">
                  {/* Only show "Chat with Coach" button when not on the chat page */}
                  {!isOnChatPage && (
                    <Link 
                      to="/chat" 
                      className="block w-full"
                      onClick={() => setIsOpen(false)}
                    >
                      <Button variant="outline" size="sm" className="w-full rounded-lg border-humanly-teal/20 hover:bg-humanly-teal/5 transition-all duration-300">
                        Chat with Coach
                      </Button>
                    </Link>
                  )}
                  
                  {/* Only show "View Progress" button when not on the progress page */}
                  {!isOnProgressPage && !isOnChatPage && (
                    <Link 
                      to="/progress" 
                      className="block w-full"
                      onClick={() => setIsOpen(false)}
                    >
                      <Button variant="outline" size="sm" className="w-full rounded-lg border-humanly-teal/20 hover:bg-humanly-teal/5 transition-all duration-300">
                        View Progress
                      </Button>
                    </Link>
                  )}
                  
                  <div className="mt-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-full flex items-center justify-start gap-2 rounded-md transition-all duration-300 hover:bg-humanly-teal/5">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user?.avatar_url || generateAvatar(user?.name || user?.email || "")} alt={user?.name || "User"} />
                            <AvatarFallback>{user?.name?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm truncate">
                            {user?.name || user?.email || "Your Account"}
                          </span>
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
                          <Link to="/progress" onClick={() => setIsOpen(false)}>Your Progress</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="rounded-md transition-colors hover:bg-humanly-pastel-mint/50 cursor-pointer">
                          <Link to="/settings" onClick={() => setIsOpen(false)}>Settings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="rounded-md transition-colors hover:bg-humanly-pastel-mint/50 cursor-pointer">
                          <Link to="/subscription" onClick={() => setIsOpen(false)}>Subscription</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => { 
                            logout();
                            setIsOpen(false);
                          }} 
                          className="rounded-md text-red-500 hover:text-red-600 transition-colors hover:bg-red-50 cursor-pointer"
                        >
                          Log out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" className="block w-full" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full rounded-lg transition-all duration-300 hover:bg-humanly-pastel-blue/30 border-humanly-teal/20">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup" className="block w-full" onClick={() => setIsOpen(false)}>
                    <Button size="sm" className="w-full rounded-lg bg-gradient-to-r from-humanly-teal to-humanly-teal/90 transition-all duration-300 hover:shadow-md hover:scale-105">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
