
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { 
  AVATAR_OPTIONS, 
  generateAvatarUrl
} from "@/lib/avatar-options";
import AvatarGrid from "./AvatarGrid";
import AvatarBrowser from "./AvatarBrowser";
import AvatarUpload from "./AvatarUpload";

// Pre-defined avatar options for quick selection (first 6 seeds)
const QUICK_AVATAR_OPTIONS = AVATAR_OPTIONS.slice(0, 6).map(option => ({
  seed: option.seed,
  url: generateAvatarUrl(option.seed),
  features: option.features
}));

const AvatarSelector = () => {
  const { user, updateProfile } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState<string>(user?.avatar_url || "");

  // Handle selecting a pre-defined avatar
  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
  };

  // Save the selected avatar to the user profile
  const saveAvatar = async () => {
    if (!user) return;

    try {
      await updateProfile({ avatar_url: selectedAvatar });
      // Removed success toast
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
      <AvatarGrid 
        avatars={QUICK_AVATAR_OPTIONS}
        selectedAvatar={selectedAvatar}
        onSelectAvatar={handleAvatarSelect}
      />

      {/* Avatar browser dialog */}
      <AvatarBrowser 
        selectedAvatar={selectedAvatar}
        onSelectAvatar={handleAvatarSelect}
      />

      <div className="flex flex-col sm:flex-row gap-2">
        <AvatarUpload 
          userId={user?.id}
          onAvatarUploaded={handleAvatarSelect}
        />
        <Button onClick={saveAvatar} disabled={!selectedAvatar}>
          Save Avatar
        </Button>
      </div>
    </div>
  );
};

export default AvatarSelector;
