
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import { Shield, Share2 } from "lucide-react";
import { User } from "@/types";
import { MobileUserOptions } from "./MobileUserOptions";

interface AuthenticatedActionsProps {
  user: User | null;
  isAdmin: boolean;
  isOnDashboardPage: boolean;
  isOnChatPage: boolean;
  isOnProgressPage: boolean;
  handleMenuItemClick: () => void;
  logout: () => void;
}

export function AuthenticatedActions({ 
  user, 
  isAdmin, 
  isOnDashboardPage,
  isOnChatPage,
  isOnProgressPage,
  handleMenuItemClick,
  logout
}: AuthenticatedActionsProps) {
  return (
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
      <MobileUserOptions 
        user={user}
        isAdmin={isAdmin}
        handleMenuItemClick={handleMenuItemClick}
        logout={logout}
      />
    </>
  );
}
