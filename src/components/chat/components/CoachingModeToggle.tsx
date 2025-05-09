
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Switch } from "@/components/ui/switch";
import { Toggle } from "@/components/ui/toggle";
import { CoachingMode } from "@/types";
import { ToggleLeft, ToggleRight } from "lucide-react";

export function CoachingModeToggle() {
  const { user, setCoachingMode } = useAuth();
  const [isToughMode, setIsToughMode] = useState<boolean>(
    user?.coaching_mode === "tough"
  );

  // Update local state when user's coaching mode changes
  useEffect(() => {
    setIsToughMode(user?.coaching_mode === "tough");
  }, [user?.coaching_mode]);

  const handleToggleChange = async (checked: boolean) => {
    const newMode: CoachingMode = checked ? "tough" : "normal";
    setIsToughMode(checked);
    
    try {
      await setCoachingMode(newMode);
    } catch (error) {
      console.error("Failed to update coaching mode:", error);
      // Revert UI state if the update fails
      setIsToughMode(user?.coaching_mode === "tough");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 text-sm">
        <span className={`${!isToughMode ? "text-humanly-indigo font-medium" : "text-muted-foreground"}`}>Normal</span>
        <Switch
          checked={isToughMode}
          onCheckedChange={handleToggleChange}
          aria-label="Toggle coaching mode"
          className="data-[state=checked]:bg-humanly-teal"
        />
        <span className={`${isToughMode ? "text-humanly-teal font-medium" : "text-muted-foreground"}`}>Tough</span>
      </div>
    </div>
  );
}
