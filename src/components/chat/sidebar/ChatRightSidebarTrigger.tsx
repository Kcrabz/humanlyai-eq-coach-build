
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export function ChatRightSidebarTrigger() {
  // Specifically use the right sidebar context
  const { toggleSidebar, open, setOpen } = useSidebar("right");
  const isMobile = useIsMobile();
  
  // Close sidebar by default on mobile
  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [isMobile, setOpen]);
  
  return (
    <Button
      variant="ghost" 
      size="icon" 
      className={`h-9 w-9 flex items-center justify-center rounded-full bg-humanly-pastel-lavender/30 text-humanly-indigo hover:bg-humanly-pastel-lavender/50 transition-colors duration-300 ${
        open ? 'bg-humanly-pastel-lavender/50' : ''
      } z-10 relative`}
      aria-label="Toggle User Menu"
      onClick={() => toggleSidebar()}
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}
