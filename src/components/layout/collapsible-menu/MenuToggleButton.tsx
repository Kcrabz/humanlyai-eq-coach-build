
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { CollapsibleTrigger } from "@/components/ui/collapsible";

interface MenuToggleButtonProps {
  isOpen: boolean;
}

export function MenuToggleButton({ isOpen }: MenuToggleButtonProps) {
  return (
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
  );
}
