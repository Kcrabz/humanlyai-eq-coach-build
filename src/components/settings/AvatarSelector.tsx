
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserRound, Camera, Upload, Grid, Search, Filter } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AVATAR_OPTIONS, AVATAR_SEEDS, generateAvatarUrl, filterAvatars, 
  getFeatureOptions, AvatarFeatures 
} from "@/lib/avatar-options";
import { Badge } from "@/components/ui/badge";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";

// Pre-defined avatar options for quick selection (first 6 seeds)
const QUICK_AVATAR_OPTIONS = AVATAR_OPTIONS.slice(0, 6).map(option => ({
  seed: option.seed,
  url: generateAvatarUrl(option.seed),
  features: option.features
}));

const AvatarSelector = () => {
  const { user, updateProfile } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState<string>(user?.avatar_url || "");
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [featureFilters, setFeatureFilters] = useState<{
    gender?: string,
    accessories?: string[],
    style?: string
  }>({});
  
  // Get available feature options
  const featureOptions = getFeatureOptions();

  // Handle selecting a pre-defined avatar
  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    setDialogOpen(false);
  };

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

  // Handle custom avatar upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    try {
      setIsUploading(true);
      
      // Generate a unique file name
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      if (publicUrlData) {
        // Update the avatar URL in the profile
        setSelectedAvatar(publicUrlData.publicUrl);
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Save the selected avatar to the user profile
  const saveAvatar = async () => {
    if (!user) return;

    try {
      await updateProfile({ avatar_url: selectedAvatar });
      toast.success("Avatar updated successfully");
    } catch (error) {
      console.error("Error saving avatar:", error);
      toast.error("Failed to update avatar");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={selectedAvatar} alt="User avatar" />
          <AvatarFallback>
            <UserRound className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-medium">Your Avatar</h3>
          <p className="text-sm text-muted-foreground">
            Choose an avatar or upload your own
          </p>
        </div>
      </div>

      {/* Quick selection grid */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {QUICK_AVATAR_OPTIONS.map((avatar, index) => (
          <button
            key={index}
            className={`rounded-md p-1 transition-all ${
              selectedAvatar === avatar.url
                ? "ring-2 ring-primary ring-offset-2"
                : "hover:ring-2 hover:ring-muted"
            }`}
            onClick={() => handleAvatarSelect(avatar.url)}
          >
            <Avatar>
              <AvatarImage src={avatar.url} alt={`Avatar option ${index + 1}`} />
              <AvatarFallback>
                <UserRound className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </button>
        ))}
      </div>

      {/* Dialog for more avatar options with feature filtering */}
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
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search avatars by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            {/* Feature filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Gender filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={cn(
                      "h-8 border-dashed",
                      featureFilters.gender && "bg-primary/10 border-primary/40 text-primary"
                    )}
                  >
                    Gender
                    {featureFilters.gender && (
                      <Badge variant="secondary" className="ml-2 rounded-sm">
                        {featureFilters.gender}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Command>
                    <CommandGroup>
                      {featureOptions.genders.map(gender => (
                        <CommandItem
                          key={gender}
                          onSelect={() => toggleFilter('gender', gender)}
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
                      featureFilters.accessories?.length && "bg-primary/10 border-primary/40 text-primary"
                    )}
                  >
                    Features
                    {featureFilters.accessories?.length ? (
                      <Badge variant="secondary" className="ml-2 rounded-sm">
                        {featureFilters.accessories.length}
                      </Badge>
                    ) : null}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Command>
                    <CommandGroup>
                      {featureOptions.accessories.map(acc => (
                        <CommandItem
                          key={acc}
                          onSelect={() => toggleFilter('accessories', acc)}
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
                      featureFilters.style && "bg-primary/10 border-primary/40 text-primary"
                    )}
                  >
                    Style
                    {featureFilters.style && (
                      <Badge variant="secondary" className="ml-2 rounded-sm">
                        {featureFilters.style}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Command>
                    <CommandGroup>
                      {featureOptions.styles.map(style => (
                        <CommandItem
                          key={style}
                          onSelect={() => toggleFilter('style', style)}
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
              {(featureFilters.gender || featureFilters.accessories?.length || featureFilters.style || searchTerm) && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={resetFilters}
                  className="h-8"
                >
                  Reset filters
                </Button>
              )}
            </div>
            
            {/* Active filters display */}
            {(featureFilters.gender || featureFilters.accessories?.length || featureFilters.style) && (
              <div className="flex flex-wrap gap-1.5">
                {featureFilters.gender && (
                  <Badge 
                    variant="secondary" 
                    className="cursor-pointer"
                    onClick={() => toggleFilter('gender', featureFilters.gender!)}
                  >
                    {featureFilters.gender}
                    <span className="ml-1">×</span>
                  </Badge>
                )}
                {featureFilters.accessories?.map(acc => (
                  <Badge 
                    key={acc}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => toggleFilter('accessories', acc)}
                  >
                    {acc}
                    <span className="ml-1">×</span>
                  </Badge>
                ))}
                {featureFilters.style && (
                  <Badge 
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => toggleFilter('style', featureFilters.style)}
                  >
                    {featureFilters.style}
                    <span className="ml-1">×</span>
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Avatar grid with scroll area */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filteredAvatarSeeds.map((avatar, index) => {
                const avatarUrl = generateAvatarUrl(avatar.seed);
                return (
                  <div 
                    key={index}
                    className={`flex flex-col items-center gap-1 cursor-pointer p-2 rounded-md transition-all ${
                      selectedAvatar === avatarUrl
                        ? "bg-primary/10 ring-2 ring-primary"
                        : "hover:bg-accent"
                    }`}
                    onClick={() => handleAvatarSelect(avatarUrl)}
                  >
                    <Avatar className="h-16 w-16 mb-1">
                      <AvatarImage src={avatarUrl} alt={`Avatar ${avatar.seed}`} />
                      <AvatarFallback>
                        <UserRound className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-center truncate w-full font-medium">{avatar.seed}</span>
                    <div className="flex flex-wrap justify-center gap-1">
                      {avatar.features.gender && (
                        <Badge variant="outline" className="text-[0.6rem] px-1 py-0 h-4">
                          {avatar.features.gender}
                        </Badge>
                      )}
                      {avatar.features.accessories?.includes('glasses') && (
                        <Badge variant="outline" className="text-[0.6rem] px-1 py-0 h-4">
                          glasses
                        </Badge>
                      )}
                      {avatar.features.accessories?.includes('beard') && (
                        <Badge variant="outline" className="text-[0.6rem] px-1 py-0 h-4">
                          beard
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredAvatarSeeds.length === 0 && (
                <div className="col-span-5 p-4 text-center text-muted-foreground">
                  No avatars found matching your search criteria
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Input
            type="file"
            id="avatar-upload"
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <Button
            variant="outline"
            className="w-full flex items-center gap-2"
            disabled={isUploading}
          >
            <Upload size={16} />
            {isUploading ? "Uploading..." : "Upload Custom"}
          </Button>
        </div>
        <Button onClick={saveAvatar} disabled={!selectedAvatar || isUploading}>
          Save Avatar
        </Button>
      </div>
    </div>
  );
};

export default AvatarSelector;
