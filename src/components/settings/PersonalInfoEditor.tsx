
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { User } from "lucide-react";

interface PersonalInfoEditorProps {
  className?: string;
}

export function PersonalInfoEditor({ className }: PersonalInfoEditorProps) {
  const { user, forceUpdateProfile } = useAuth();
  const [firstName, setFirstName] = useState<string>(user?.first_name || "");
  const [lastName, setLastName] = useState<string>(user?.last_name || "");
  const [displayName, setDisplayName] = useState<string>(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsSaving(true);
    try {
      const updates = {
        first_name: firstName,
        last_name: lastName,
        name: displayName || `${firstName} ${lastName}`.trim()
      };
      
      const success = await forceUpdateProfile(updates);
      
      if (success) {
        toast.success("Profile information updated successfully");
      } else {
        toast.error("Failed to update profile information");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-humanly-teal" /> 
          Personal Information
        </CardTitle>
        <CardDescription>
          Update your personal information
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">First Name</Label>
              <Input
                id="first-name"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name</Label>
              <Input
                id="last-name"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="display-name">Display Name (optional)</Label>
            <Input
              id="display-name"
              placeholder="How you want to be called"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              If left empty, your display name will be created from your first and last name
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ""}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              To change your email address, contact support
            </p>
          </div>
          
          <div className="pt-2">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
