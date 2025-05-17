
import { memo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface UserFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  tierFilter: string;
  setTierFilter: (tier: string) => void;
  archetypeFilter: string;
  setArchetypeFilter: (archetype: string) => void;
  onboardedFilter: string;
  setOnboardedFilter: (onboarded: string) => void;
  onRefresh: () => void;
}

const UserFiltersComponent = ({
  searchTerm,
  setSearchTerm,
  tierFilter,
  setTierFilter,
  archetypeFilter,
  setArchetypeFilter,
  onboardedFilter,
  setOnboardedFilter,
  onRefresh
}: UserFiltersProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by email or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="basic">Basic</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={archetypeFilter} onValueChange={setArchetypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by archetype" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Archetypes</SelectItem>
            <SelectItem value="reflector">Reflector</SelectItem>
            <SelectItem value="activator">Activator</SelectItem>
            <SelectItem value="regulator">Regulator</SelectItem>
            <SelectItem value="connector">Connector</SelectItem>
            <SelectItem value="observer">Observer</SelectItem>
            <SelectItem value="not-set">Not Set</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={onboardedFilter} onValueChange={setOnboardedFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by onboarded" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="true">Onboarded</SelectItem>
            <SelectItem value="false">Not Onboarded</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button onClick={onRefresh} variant="outline">
        Refresh
      </Button>
    </div>
  );
};

export const UserFilters = memo(UserFiltersComponent);
