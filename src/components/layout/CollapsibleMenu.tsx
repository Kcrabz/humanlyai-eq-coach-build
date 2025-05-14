
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useIsMobile } from "@/hooks/use-mobile";
import { MenuToggleButton } from "./collapsible-menu/MenuToggleButton";
import { BrandLogo } from "./collapsible-menu/BrandLogo";
import { NavigationLinks } from "./collapsible-menu/NavigationLinks";
import { AuthenticatedActions } from "./collapsible-menu/AuthenticatedActions";
import { UnauthenticatedActions } from "./collapsible-menu/UnauthenticatedActions";

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
        {/* Repositioned toggle button */}
        <MenuToggleButton isOpen={isOpen} />
        
        <CollapsibleContent className="mt-2 enhanced-header animate-slide-up max-h-[90vh] overflow-y-auto">
          <div className="container mx-auto py-4 px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              {/* Brand logo */}
              <BrandLogo handleMenuItemClick={handleMenuItemClick} />

              {/* Navigation links */}
              <NavigationLinks handleMenuItemClick={handleMenuItemClick} />

              {/* Auth-based actions */}
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                {isAuthenticated ? (
                  <AuthenticatedActions 
                    user={user}
                    isAdmin={isAdmin}
                    isOnDashboardPage={isOnDashboardPage}
                    isOnChatPage={isOnChatPage}
                    isOnProgressPage={isOnProgressPage}
                    handleMenuItemClick={handleMenuItemClick}
                    logout={logout}
                  />
                ) : (
                  <UnauthenticatedActions handleMenuItemClick={handleMenuItemClick} />
                )}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
