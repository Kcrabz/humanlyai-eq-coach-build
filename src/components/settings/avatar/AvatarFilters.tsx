
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface AvatarFiltersProps {
  filterOptions: {
    genders: string[];
    accessories: string[];
    styles: string[];
  };
  activeFilters: {
    gender?: string;
    accessories?: string[];
    style?: string;
  };
  onToggleFilter: (type: 'gender' | 'accessories' | 'style', value: string) => void;
  onResetFilters: () => void;
  isFilterActive: (type: 'gender' | 'accessories' | 'style', value: string) => boolean;
}

const AvatarFilters: React.FC<AvatarFiltersProps> = ({
  filterOptions,
  activeFilters,
  onToggleFilter,
  onResetFilters,
  isFilterActive,
}) => {
  const hasActiveFilters = activeFilters.gender || 
                          (activeFilters.accessories && activeFilters.accessories.length > 0) || 
                          activeFilters.style;

  return (
    <div className="space-y-3">
      {/* Filter buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Gender filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className={cn(
                "h-8 border-dashed",
                activeFilters.gender && "bg-primary/10 border-primary/40 text-primary"
              )}
            >
              Gender
              {activeFilters.gender && (
                <Badge variant="secondary" className="ml-2 rounded-sm">
                  {activeFilters.gender}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start">
            <Command>
              <CommandGroup>
                {filterOptions.genders.map(gender => (
                  <CommandItem
                    key={gender}
                    onSelect={() => onToggleFilter('gender', gender)}
                  >
                    <div 
                      className={cn(
                        "mr-2 h-4 w-4 rounded-sm border",
                        isFilterActive('gender', gender) 
                          ? "bg-primary border-primary" 
                          : "border-muted"
                      )}
                    />
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        
        {/* Accessories filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className={cn(
                "h-8 border-dashed",
                activeFilters.accessories?.length && "bg-primary/10 border-primary/40 text-primary"
              )}
            >
              Features
              {activeFilters.accessories?.length ? (
                <Badge variant="secondary" className="ml-2 rounded-sm">
                  {activeFilters.accessories.length}
                </Badge>
              ) : null}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start">
            <Command>
              <CommandGroup>
                {filterOptions.accessories.map(acc => (
                  <CommandItem
                    key={acc}
                    onSelect={() => onToggleFilter('accessories', acc)}
                  >
                    <div 
                      className={cn(
                        "mr-2 h-4 w-4 rounded-sm border",
                        isFilterActive('accessories', acc) 
                          ? "bg-primary border-primary" 
                          : "border-muted"
                      )}
                    />
                    {acc.charAt(0).toUpperCase() + acc.slice(1)}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        
        {/* Style filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className={cn(
                "h-8 border-dashed",
                activeFilters.style && "bg-primary/10 border-primary/40 text-primary"
              )}
            >
              Style
              {activeFilters.style && (
                <Badge variant="secondary" className="ml-2 rounded-sm">
                  {activeFilters.style}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start">
            <Command>
              <CommandGroup>
                {filterOptions.styles.map(style => (
                  <CommandItem
                    key={style}
                    onSelect={() => onToggleFilter('style', style)}
                  >
                    <div 
                      className={cn(
                        "mr-2 h-4 w-4 rounded-sm border",
                        isFilterActive('style', style) 
                          ? "bg-primary border-primary" 
                          : "border-muted"
                      )}
                    />
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        
        {/* Reset filters button */}
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onResetFilters}
            className="h-8"
          >
            Reset filters
          </Button>
        )}
      </div>
      
      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5">
          {activeFilters.gender && (
            <Badge 
              variant="secondary" 
              className="cursor-pointer"
              onClick={() => onToggleFilter('gender', activeFilters.gender!)}
            >
              {activeFilters.gender}
              <span className="ml-1">×</span>
            </Badge>
          )}
          {activeFilters.accessories?.map(acc => (
            <Badge 
              key={acc}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => onToggleFilter('accessories', acc)}
            >
              {acc}
              <span className="ml-1">×</span>
            </Badge>
          ))}
          {activeFilters.style && (
            <Badge 
              variant="secondary"
              className="cursor-pointer"
              onClick={() => onToggleFilter('style', activeFilters.style)}
            >
              {activeFilters.style}
              <span className="ml-1">×</span>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default AvatarFilters;
