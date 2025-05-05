
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const MAX_BIO_LENGTH = 250;

const BioEditor = () => {
  const { user, updateProfile } = useAuth();
  const [bio, setBio] = useState<string>(user?.bio || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newBio = e.target.value;
    if (newBio.length <= MAX_BIO_LENGTH) {
      setBio(newBio);
    }
  };

  const saveBio = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      await updateProfile({ bio });
      toast.success("Bio updated successfully");
    } catch (error) {
      console.error("Error saving bio:", error);
      toast.error("Failed to update bio");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Your Bio</h3>
        <p className="text-sm text-muted-foreground">
          Tell Kai a bit about yourself. This helps provide more personalized coaching.
        </p>
      </div>

      <div className="space-y-2">
        <Textarea
          value={bio}
          onChange={handleBioChange}
          placeholder="Share something about yourself, your interests, goals, or what you're working on..."
          className="min-h-[120px]"
        />
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {bio.length}/{MAX_BIO_LENGTH} characters
          </span>
          <Button onClick={saveBio} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Bio"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BioEditor;
