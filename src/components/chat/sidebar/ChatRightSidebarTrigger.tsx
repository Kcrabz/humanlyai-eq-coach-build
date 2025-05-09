
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

export function ChatRightSidebarTrigger() {
  // Specifically use the right sidebar context
  const { toggleSidebar, open } = useSidebar("right");
  
  return (
    <Button
      variant="ghost" 
      size="icon" 
      className={`h-9 w-9 flex items-center justify-center rounded-full bg-humanly-pastel-lavender/30 text-humanly-indigo hover:bg-humanly-pastel-lavender/50 transition-colors duration-300 ${
        open ? 'bg-humanly-pastel-lavender/50' : ''
      }`}
      aria-label="Toggle User Menu"
      onClick={() => toggleSidebar()}
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}
