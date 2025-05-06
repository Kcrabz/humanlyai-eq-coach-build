
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Grid } from "lucide-react";
import { filterAvatars, getFeatureOptions, AVATAR_OPTIONS, generateAvatarUrl } from "@/lib/avatar-options";
import AvatarSearch from "./AvatarSearch";
import AvatarFilters from "./AvatarFilters";
import AvatarGrid from "./AvatarGrid";

interface AvatarBrowserProps {
  selectedAvatar: string;
  onSelectAvatar: (avatarUrl: string) => void;
}

const AvatarBrowser: React.FC<AvatarBrowserProps> = ({ selectedAvatar, onSelectAvatar }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [featureFilters, setFeatureFilters] = useState<{
    gender?: string,
    accessories?: string[],
    style?: string
  }>({});

  // Get available feature options
  const featureOptions = getFeatureOptions();

  // Filter avatar seeds based on search term and feature filters
  const filteredAvatarSeeds = filterAvatars(
    AVATAR_OPTIONS,
    searchTerm,
    featureFilters
  );

  // Reset all filters
  const resetFilters = () => {
    setFeatureFilters({});
    setSearchTerm("");
  };
  
  // Toggle a filter value
  const toggleFilter = (type: 'gender' | 'accessories' | 'style', value: string) => {
    if (type === 'accessories') {
      const currentAccessories = featureFilters.accessories || [];
      if (currentAccessories.includes(value)) {
        setFeatureFilters({
          ...featureFilters,
          accessories: currentAccessories.filter(a => a !== value)
        });
      } else {
        setFeatureFilters({
          ...featureFilters,
          accessories: [...currentAccessories, value]
        });
      }
    } else {
      // For single-select filters like gender and style
      if (featureFilters[type] === value) {
        // If already selected, deselect it
        const newFilters = { ...featureFilters };
        delete newFilters[type];
        setFeatureFilters(newFilters);
      } else {
        setFeatureFilters({
          ...featureFilters,
          [type]: value
        });
      }
    }
  };

  // Check if a filter is active
  const isFilterActive = (type: 'gender' | 'accessories' | 'style', value: string) => {
    if (type === 'accessories') {
      return (featureFilters.accessories || []).includes(value);
    }
    return featureFilters[type] === value;
  };

  // Handle selecting an avatar
  const handleAvatarSelect = (avatarUrl: string) => {
    onSelectAvatar(avatarUrl);
    setDialogOpen(false);
  };

  const avatarsWithUrls = filteredAvatarSeeds.map(avatar => ({
    ...avatar,
    url: generateAvatarUrl(avatar.seed)
  }));

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full flex items-center gap-2 mb-2">
          <Grid size={16} />
          Browse More Avatars
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select an Avatar</DialogTitle>
        </DialogHeader>
        
        {/* Search and filters section */}
        <div className="mb-4 space-y-3">
          <AvatarSearch 
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm} 
          />
          
          <AvatarFilters
            filterOptions={featureOptions}
            activeFilters={featureFilters}
            onToggleFilter={toggleFilter}
            onResetFilters={resetFilters}
            isFilterActive={isFilterActive}
          />
        </div>

        {/* Avatar grid with scroll area */}
        <ScrollArea className="h-[400px] pr-4">
          <AvatarGrid 
            avatars={avatarsWithUrls}
            selectedAvatar={selectedAvatar}
            onSelectAvatar={handleAvatarSelect}
            showFeatureBadges={true}
          />
        </ScrollArea>
        
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarBrowser;
