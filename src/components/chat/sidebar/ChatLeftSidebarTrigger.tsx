
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

export function ChatLeftSidebarTrigger() {
  // Specifically use the left sidebar context
  const { toggleSidebar } = useSidebar("left");
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-9 w-9 flex items-center justify-center rounded-full bg-white shadow-soft text-humanly-indigo hover:bg-humanly-pastel-lavender/30 transition-colors duration-300" 
      aria-label="Toggle Left Sidebar"
      onClick={() => toggleSidebar()}
    >
      <PanelLeft className="h-5 w-5" />
    </Button>
  );
}
