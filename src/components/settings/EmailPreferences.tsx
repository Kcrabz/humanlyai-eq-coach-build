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

const defaultPreferences = {
  daily_nudges: true,
  weekly_summary: true,
  achievement_notifications: true,
  challenge_reminders: true,
  inactivity_reminders: true
};

export const EmailPreferences: React.FC<EmailPreferencesProps> = ({ className }) => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<Partial<EmailPreference>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load email preferences
  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Use createIfMissing=true to ensure preferences are stored for future updates
      const { data, error } = await emailService.getEmailPreferences(undefined, true);

      if (error) {
        console.error("Error loading preferences:", error);
        toast.error("Please try again later");
        return;
      }
      
      if (data) {
        setPreferences(data);
      }
    } catch (err) {
      console.error("Error in loadPreferences:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const savePreferences = async () => {
    if (!user) return;

    try {
      setSaving(true);
      const success = await emailService.updatePreferences(preferences);

      if (success) {
        toast("Preferences updated", {
          description: "Your email preferences have been saved",
        });
      } else {
        toast.error("Please try again later");
      }
    } catch (err) {
      console.error("Error saving preferences:", err);
      toast.error("Please try again later");
    } finally {
      setSaving(false);
    }
  };

  const handleOptOut = async () => {
    if (!user) return;

    try {
      setSaving(true);
      const success = await emailService.optOutAll();

      if (success) {
        // Update local state to reflect all options being disabled
        setPreferences({
          daily_nudges: false,
          weekly_summary: false,
          achievement_notifications: false,
          challenge_reminders: false,
          inactivity_reminders: false,
        });

        toast("Opted out successfully", {
          description: "You've been unsubscribed from all emails",
        });
      } else {
        toast.error("Please try again later");
      }
    } catch (err) {
      console.error("Error opting out:", err);
      toast.error("Please try again later");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Email Preferences</CardTitle>
          <CardDescription>Manage the emails you receive</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Email Preferences</CardTitle>
        <CardDescription>Manage the emails you receive</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Daily Nudges</h4>
              <p className="text-sm text-muted-foreground">
                Receive daily prompts to continue your EQ journey
              </p>
            </div>
            <Switch 
              checked={preferences.daily_nudges} 
              onCheckedChange={() => handleToggle("daily_nudges")} 
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Weekly Summary</h4>
              <p className="text-sm text-muted-foreground">
                Get a weekly report on your progress and achievements
              </p>
            </div>
            <Switch 
              checked={preferences.weekly_summary} 
              onCheckedChange={() => handleToggle("weekly_summary")} 
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Achievement Notifications</h4>
              <p className="text-sm text-muted-foreground">
                Get notified when you unlock new achievements
              </p>
            </div>
            <Switch 
              checked={preferences.achievement_notifications} 
              onCheckedChange={() => handleToggle("achievement_notifications")} 
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Challenge Reminders</h4>
              <p className="text-sm text-muted-foreground">
                Receive reminders about pending challenges
              </p>
            </div>
            <Switch 
              checked={preferences.challenge_reminders} 
              onCheckedChange={() => handleToggle("challenge_reminders")} 
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Inactivity Reminders</h4>
              <p className="text-sm text-muted-foreground">
                Get gentle reminders if you haven't logged in for a while
              </p>
            </div>
            <Switch 
              checked={preferences.inactivity_reminders} 
              onCheckedChange={() => handleToggle("inactivity_reminders")} 
            />
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button 
            variant="outline" 
            onClick={handleOptOut}
            disabled={saving}
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Opt out of all
          </Button>
          <Button 
            onClick={savePreferences}
            disabled={saving}
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailPreferences;
