
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface AvatarSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const AvatarSearch: React.FC<AvatarSearchProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search avatars by name..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-8"
      />
    </div>
  );
};

export default AvatarSearch;
