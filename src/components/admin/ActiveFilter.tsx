
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { FilterState } from "@/hooks/useUserManagement/types";

interface ActiveFilterProps {
  activeFilter: FilterState | null;
  onReset: () => void;
}

export const ActiveFilter = ({ activeFilter, onReset }: ActiveFilterProps) => {
  if (!activeFilter) return null;
  
  return (
    <div className="bg-muted p-3 rounded-md flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        <span>Viewing: <strong>{activeFilter.type}: {activeFilter.value}</strong></span>
      </div>
      <Button variant="ghost" size="sm" onClick={onReset} className="h-8 px-2">
        <X className="h-4 w-4 mr-1" /> Clear Filter
      </Button>
    </div>
  );
};
