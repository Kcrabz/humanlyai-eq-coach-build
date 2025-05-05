
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateAvatar } from "@/lib/utils";
import { 
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar
} from "@/components/ui/sidebar";
import { 
  User,
  Settings,
  CreditCard,
  LogOut,
  Menu,
  ChevronRight,
  Info,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Sidebar trigger button for the right sidebar
export function ChatRightSidebarTrigger() {
  // Use the right sidebar context
  const { toggleSidebar } = useSidebar("right");
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-9 w-9 flex items-center justify-center rounded-full bg-humanly-pastel-lavender/30 text-humanly-indigo hover:bg-humanly-pastel-lavender/50 transition-colors duration-300" 
      aria-label="Toggle User Menu"
      onClick={() => toggleSidebar()}
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}

export function ChatRightSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // Use the right sidebar context
  const { open, setOpen, isMobile } = useSidebar("right");
  
  if (!user) return null;
  
  return (
    <Sidebar 
      side="right" 
      variant="sidebar" 
      collapsible="offcanvas"
      className="user-sidebar"
    >
      <SidebarHeader className="p-4">
        <div className="flex flex-col items-center gap-2">
          <Avatar className="h-16 w-16 transition-transform duration-300 hover:scale-105">
            <AvatarImage src={user?.avatar_url || generateAvatar(user?.name || user?.email || "")} alt={user?.name || "User"} />
            <AvatarFallback>{user?.name?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="text-center">
            <h3 className="font-medium">{user?.name || "User"}</h3>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            {user?.subscription_tier !== "free" && (
              <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-humanly-teal/10 text-humanly-teal rounded-full">
                {user.subscription_tier.charAt(0).toUpperCase() + user.subscription_tier.slice(1)} Plan
              </span>
            )}
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-3">
        {/* Main Navigation Links */}
        <div className="space-y-1 mb-4">
          <h4 className="text-xs font-medium text-muted-foreground px-2 py-1">Main Navigation</h4>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 rounded-lg"
            onClick={() => navigate("/about")}
          >
            <Info className="h-4 w-4" />
            About
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 rounded-lg"
            onClick={() => navigate("/pricing")}
          >
            <DollarSign className="h-4 w-4" />
            Pricing
          </Button>
        </div>
        
        <Separator className="my-3" />
        
        {/* User Profile Links */}
        <div className="space-y-1">
          <h4 className="text-xs font-medium text-muted-foreground px-2 py-1">Your Account</h4>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 rounded-lg"
            onClick={() => navigate("/settings")}
          >
            <User className="h-4 w-4" />
            Your Bio
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 rounded-lg"
            onClick={() => navigate("/subscription")}
          >
            <CreditCard className="h-4 w-4" />
            Your Plan
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 rounded-lg"
            onClick={() => navigate("/settings")}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
        
        <Separator className="my-3" />
        
        {user.eq_archetype && user.eq_archetype !== "Not set" && (
          <div className="bg-white rounded-lg border border-gray-100 p-3 mb-4 shadow-sm">
            <h4 className="text-sm font-medium flex items-center gap-1 text-humanly-indigo">
              Your EQ Archetype
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-5 w-5 p-0 rounded-full ml-auto" 
                onClick={() => navigate("/onboarding?step=archetype")}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl">{user.eq_archetype === "reflector" ? "🔮" : 
                user.eq_archetype === "activator" ? "⚡️" : 
                user.eq_archetype === "connector" ? "🤝" : 
                user.eq_archetype === "regulator" ? "🧘‍♂️" : 
                user.eq_archetype === "observer" ? "👁️" : "🔍"}
              </span>
              <span className="font-medium text-sm">
                {user.eq_archetype.charAt(0).toUpperCase() + user.eq_archetype.slice(1)}
              </span>
            </div>
          </div>
        )}
        
        {user.bio && (
          <div className="bg-white rounded-lg border border-gray-100 p-3 shadow-sm">
            <h4 className="text-sm font-medium flex items-center gap-1 text-humanly-indigo">
              Your Bio
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-5 w-5 p-0 rounded-full ml-auto" 
                onClick={() => navigate("/settings")}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </h4>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
              {user.bio}
            </p>
          </div>
        )}
      </SidebarContent>
      
      <SidebarFooter className="p-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg border-red-100"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
