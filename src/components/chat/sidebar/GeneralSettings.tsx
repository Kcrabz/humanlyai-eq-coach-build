
import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor, Volume2, VolumeX } from "lucide-react";

export const GeneralSettings = () => {
  const { theme, setTheme } = useTheme();
  const [isSoundEnabled, setIsSoundEnabled] = React.useState(true);

  const toggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
    // In a real app, you'd save this preference
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-4">Appearance</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={theme === "light" ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme("light")}
            className="flex items-center"
          >
            <Sun className="h-4 w-4 mr-1" />
            Light
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme("dark")}
            className="flex items-center"
          >
            <Moon className="h-4 w-4 mr-1" />
            Dark
          </Button>
          <Button
            variant={theme === "system" ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme("system")}
            className="flex items-center"
          >
            <Monitor className="h-4 w-4 mr-1" />
            System
          </Button>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-medium mb-4">Sound</h3>
        <Button
          variant={isSoundEnabled ? "default" : "outline"}
          size="sm"
          onClick={toggleSound}
          className="flex items-center"
        >
          {isSoundEnabled ? (
            <>
              <Volume2 className="h-4 w-4 mr-1" />
              Sound On
            </>
          ) : (
            <>
              <VolumeX className="h-4 w-4 mr-1" />
              Sound Off
            </>
          )}
        </Button>
      </div>

      <Separator />

      <div>
        <h3 className="font-medium mb-2">About</h3>
        <p className="text-sm text-muted-foreground mb-2">
          Humanly - EQ Coach
        </p>
        <p className="text-xs text-muted-foreground">
          Version 1.0.0
        </p>
      </div>
    </div>
  );
};
