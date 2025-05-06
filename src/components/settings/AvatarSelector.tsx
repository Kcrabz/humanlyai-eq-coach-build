
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserRound, Camera, Upload } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Pre-defined avatar options with lorelei style
const AVATAR_OPTIONS = [
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Felix",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Milo",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Zoe",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Bailey",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Charlie"
];

const AvatarSelector = () => {
  const { user, updateProfile } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState<string>(user?.avatar_url || "");
  const [isUploading, setIsUploading] = useState(false);

  // Handle selecting a pre-defined avatar
  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
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

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {AVATAR_OPTIONS.map((avatar, index) => (
          <button
            key={index}
            className={`rounded-md p-1 transition-all ${
              selectedAvatar === avatar
                ? "ring-2 ring-primary ring-offset-2"
                : "hover:ring-2 hover:ring-muted"
            }`}
            onClick={() => handleAvatarSelect(avatar)}
          >
            <Avatar>
              <AvatarImage src={avatar} alt={`Avatar option ${index + 1}`} />
              <AvatarFallback>
                <UserRound className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </button>
        ))}
      </div>

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
