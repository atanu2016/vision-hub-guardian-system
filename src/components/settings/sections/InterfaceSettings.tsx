
import { Moon, Bell, Volume2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface InterfaceSettingsProps {
  darkMode: boolean;
  notifications: boolean;
  audio: boolean;
  onChangeDarkMode: (enabled: boolean) => void;
  onChangeNotifications: (enabled: boolean) => void;
  onChangeAudio: (enabled: boolean) => void;
}

const InterfaceSettings = ({
  darkMode,
  notifications,
  audio,
  onChangeDarkMode,
  onChangeNotifications,
  onChangeAudio
}: InterfaceSettingsProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Interface Settings</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Moon className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="dark-mode" className="font-medium">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Enable dark theme for the interface</p>
            </div>
          </div>
          <Switch 
            id="dark-mode" 
            checked={darkMode} 
            onCheckedChange={onChangeDarkMode} 
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="notifications" className="font-medium">Notifications</Label>
              <p className="text-sm text-muted-foreground">Enable system notifications</p>
            </div>
          </div>
          <Switch 
            id="notifications" 
            checked={notifications} 
            onCheckedChange={onChangeNotifications} 
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Volume2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="audio" className="font-medium">Audio</Label>
              <p className="text-sm text-muted-foreground">Enable audio for live video</p>
            </div>
          </div>
          <Switch 
            id="audio" 
            checked={audio} 
            onCheckedChange={onChangeAudio} 
          />
        </div>
      </div>
    </div>
  );
};

export default InterfaceSettings;
