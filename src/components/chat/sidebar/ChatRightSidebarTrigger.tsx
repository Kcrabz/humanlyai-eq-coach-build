
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

export function ChatRightSidebarTrigger() {
  const { open, setOpen } = useSidebar("right");
  
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setOpen(!open)}
      className="hover:bg-humanly-pastel-lavender/20 hover:text-humanly-indigo"
      aria-label={open ? "Close user menu" : "Open user menu"}
      title="Access dashboard and settings"
    >
      <Menu className="h-4 w-4" />
    </Button>
  );
}
