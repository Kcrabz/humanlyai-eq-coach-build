
import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun, MonitorSmartphone, Bell, BellOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export function GeneralSettings() {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = React.useState(true);
  const [sound, setSound] = React.useState(true);
  const [volume, setVolume] = React.useState(80);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how Kai looks on your device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              <span>Light Mode</span>
            </div>
            <Switch 
              checked={theme === "dark"} 
              onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
            />
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              <span>Dark Mode</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 pt-2">
            <Button 
              variant={theme === "light" ? "default" : "outline"} 
              size="sm" 
              className="flex-1"
              onClick={() => setTheme("light")}
            >
              <Sun className="mr-2 h-4 w-4" />
              Light
            </Button>
            <Button 
              variant={theme === "dark" ? "default" : "outline"} 
              size="sm" 
              className="flex-1"
              onClick={() => setTheme("dark")}
            >
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </Button>
            <Button 
              variant={theme === "system" ? "default" : "outline"} 
              size="sm" 
              className="flex-1"
              onClick={() => setTheme("system")}
            >
              <MonitorSmartphone className="mr-2 h-4 w-4" />
              System
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Control notifications and alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Enable Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Receive alerts about new messages and updates
              </p>
            </div>
            <Switch 
              checked={notifications} 
              onCheckedChange={setNotifications} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Sound</h3>
              <p className="text-sm text-muted-foreground">
                Play sounds for new messages and notifications
              </p>
            </div>
            <Switch 
              checked={sound} 
              onCheckedChange={setSound} 
              disabled={!notifications}
            />
          </div>
          
          {sound && notifications && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Volume</h4>
                <span className="text-sm text-muted-foreground">{volume}%</span>
              </div>
              <div className="flex items-center gap-2">
                <VolumeX className="h-4 w-4 text-muted-foreground" />
                <Slider
                  value={[volume]}
                  onValueChange={(vals) => setVolume(vals[0])}
                  max={100}
                  step={1}
                />
                <Volume2 className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
