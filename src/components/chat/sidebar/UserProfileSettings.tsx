
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { User, UserPlus, Mail, Save } from "lucide-react";

export function UserProfileSettings() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = React.useState(user?.name || '');
  const [bio, setBio] = React.useState(user?.bio || '');
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      await updateProfile({ 
        name,
        bio
      });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Manage your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.avatar_url || "/images/default-avatar.png"} alt={user?.name || "User"} />
              <AvatarFallback>
                {user?.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm">
              Change Avatar
            </Button>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <div className="flex">
              <div className="bg-muted flex items-center px-3 rounded-l-md border border-r-0 border-input">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input 
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-l-none"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <div className="flex">
              <div className="bg-muted flex items-center px-3 rounded-l-md border border-r-0 border-input">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input 
                id="email"
                value={user?.email || ''}
                disabled
                className="rounded-l-none bg-muted"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Email cannot be changed
            </p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="bio" className="text-sm font-medium">
              Bio
            </label>
            <Textarea 
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us a bit about yourself..."
              className="resize-none"
              rows={4}
            />
          </div>
          
          <Button 
            onClick={handleSaveProfile} 
            disabled={isUpdating}
            className="w-full"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
