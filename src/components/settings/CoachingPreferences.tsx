
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";

interface CoachingPreferencesProps {
  className?: string;
}

export function CoachingPreferences({ className }: CoachingPreferencesProps) {
  const { user, setCoachingMode } = useAuth();
  const [selectedMode, setSelectedMode] = useState(user?.coaching_mode || "normal");
  const [isSaving, setIsSaving] = useState(false);

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      await setCoachingMode(selectedMode as "normal" | "tough");
      toast.success("Coaching preferences updated successfully");
    } catch (error) {
      console.error("Error saving coaching preferences:", error);
      toast.error("Failed to update coaching preferences");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-humanly-teal" />
          Coaching Style
        </CardTitle>
        <CardDescription>
          Choose how Kai should coach you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup
          value={selectedMode}
          onValueChange={setSelectedMode}
          className="grid gap-4"
        >
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="normal" id="normal" className="mt-1" />
            <div className="grid gap-1.5">
              <Label htmlFor="normal" className="font-medium">Supportive Coach</Label>
              <p className="text-sm text-muted-foreground">
                Kai will be gentle and encouraging, focusing on positive reinforcement and gradual growth.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="tough" id="tough" className="mt-1" />
            <div className="grid gap-1.5">
              <Label htmlFor="tough" className="font-medium">Challenging Coach</Label>
              <p className="text-sm text-muted-foreground">
                Kai will be more direct and challenging, pushing you to confront difficult emotions and situations.
              </p>
            </div>
          </div>
        </RadioGroup>
        
        <Button 
          onClick={handleSavePreferences} 
          disabled={isSaving || selectedMode === user?.coaching_mode}
        >
          {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </CardContent>
    </Card>
  );
}
