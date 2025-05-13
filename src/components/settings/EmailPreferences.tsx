import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { emailService } from "@/services/email";
import { EmailPreference } from "@/services/email/types";

interface EmailPreferencesProps {
  className?: string;
}

export function EmailPreferences({ className }: EmailPreferencesProps) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    daily_nudges: true,
    weekly_summary: true,
    achievement_notifications: true,
    challenge_reminders: true,
    inactivity_reminders: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load email preferences
  useEffect(() => {
    async function loadPreferences() {
      if (!user?.id) return;

      try {
        setLoading(true);
        const { data, error } = await emailService.getEmailPreferences(user.id);

        if (error) {
          console.error("Error loading email preferences:", error);
          
          // Create default preferences if none exist
          if (error.code === "PGRST116") {
            console.log("No preferences found, creating default preferences");
            await createDefaultPreferences();
            return;
          }
          
          toast({
            title: "Error",
            description: "Failed to load email preferences",
            variant: "destructive"
          });
          return;
        }

        // Ensure we have values for all required properties by merging with defaults
        const safeData = {
          daily_nudges: data?.daily_nudges ?? true,
          weekly_summary: data?.weekly_summary ?? true,
          achievement_notifications: data?.achievement_notifications ?? true,
          challenge_reminders: data?.challenge_reminders ?? true,
          inactivity_reminders: data?.inactivity_reminders ?? true
        };
        
        setPreferences(safeData);
      } catch (err) {
        console.error("Error in loadPreferences:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPreferences();
  }, [user?.id]);

  // Create default preferences
  const createDefaultPreferences = async () => {
    if (!user?.id) return;
    
    try {
      const defaultPrefs = {
        daily_nudges: true,
        weekly_summary: true,
        achievement_notifications: true,
        challenge_reminders: true,
        inactivity_reminders: true
      };
      
      const success = await emailService.updatePreferences(defaultPrefs);
      
      if (success) {
        setPreferences(defaultPrefs);
        setLoading(false);
      } else {
        toast({
          title: "Error",
          description: "Failed to create default preferences",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error("Error creating default preferences:", err);
      toast({
        title: "Error",
        description: "Failed to create default preferences",
        variant: "destructive"
      });
    }
  };

  // Save preferences changes
  const savePreferences = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);
      const success = await emailService.updatePreferences(preferences);

      if (success) {
        toast({
          title: "Success",
          description: "Email preferences saved successfully"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save email preferences",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error("Error in savePreferences:", err);
      toast({
        title: "Error",
        description: "An error occurred while saving preferences",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle preference toggle
  const handleToggle = (key: keyof typeof preferences, value: boolean) => {
    if (!preferences) return;
    setPreferences({ ...preferences, [key]: value });
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Email Preferences</CardTitle>
          <CardDescription>Loading your email preferences...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Email Preferences</CardTitle>
        <CardDescription>
          Manage what types of emails you receive from us
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Daily Nudges</h3>
            <p className="text-sm text-muted-foreground">
              Daily reminders and challenges to keep you engaged
            </p>
          </div>
          <Switch
            checked={preferences.daily_nudges}
            onCheckedChange={(value) => handleToggle("daily_nudges", value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Weekly Summary</h3>
            <p className="text-sm text-muted-foreground">
              A weekly report of your progress and achievements
            </p>
          </div>
          <Switch
            checked={preferences.weekly_summary}
            onCheckedChange={(value) => handleToggle("weekly_summary", value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Achievement Notifications</h3>
            <p className="text-sm text-muted-foreground">
              Get notified when you earn new achievements
            </p>
          </div>
          <Switch
            checked={preferences.achievement_notifications}
            onCheckedChange={(value) => handleToggle("achievement_notifications", value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Challenge Reminders</h3>
            <p className="text-sm text-muted-foreground">
              Reminders about new EQ challenges
            </p>
          </div>
          <Switch
            checked={preferences.challenge_reminders}
            onCheckedChange={(value) => handleToggle("challenge_reminders", value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Inactivity Reminders</h3>
            <p className="text-sm text-muted-foreground">
              Gentle nudges when you've been away for a while
            </p>
          </div>
          <Switch
            checked={preferences.inactivity_reminders}
            onCheckedChange={(value) => handleToggle("inactivity_reminders", value)}
          />
        </div>

        <Button 
          onClick={savePreferences} 
          disabled={saving} 
          className="w-full mt-6"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Preferences"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
