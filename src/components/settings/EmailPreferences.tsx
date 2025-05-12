
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EmailPreferencesProps {
  className?: string;
}

interface EmailPreferences {
  id: string;
  user_id: string;
  daily_nudges: boolean;
  weekly_summary: boolean;
  achievement_notifications: boolean;
  challenge_reminders: boolean;
  inactivity_reminders: boolean;
  created_at: string;
  updated_at: string;
}

export function EmailPreferences({ className }: EmailPreferencesProps) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<EmailPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load email preferences
  useEffect(() => {
    async function loadPreferences() {
      if (!user?.id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("email_preferences")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error loading email preferences:", error);
          toast.error("Failed to load email preferences");
          return;
        }

        setPreferences(data);
      } catch (err) {
        console.error("Error in loadPreferences:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPreferences();
  }, [user?.id]);

  // Save preferences changes
  const savePreferences = async () => {
    if (!user?.id || !preferences) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from("email_preferences")
        .update({
          daily_nudges: preferences.daily_nudges,
          weekly_summary: preferences.weekly_summary,
          achievement_notifications: preferences.achievement_notifications,
          challenge_reminders: preferences.challenge_reminders,
          inactivity_reminders: preferences.inactivity_reminders,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) {
        console.error("Error saving email preferences:", error);
        toast.error("Failed to save email preferences");
        return;
      }

      toast.success("Email preferences saved successfully");
    } catch (err) {
      console.error("Error in savePreferences:", err);
      toast.error("An error occurred while saving preferences");
    } finally {
      setSaving(false);
    }
  };

  // Handle preference toggle
  const handleToggle = (key: keyof EmailPreferences, value: boolean) => {
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

  if (!preferences) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Email Preferences</CardTitle>
          <CardDescription>There was an issue loading your preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setLoading(true)}>Try Again</Button>
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
