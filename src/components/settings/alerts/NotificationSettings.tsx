
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface NotificationSettingsProps {
  emailNotifications: boolean;
  pushNotifications: boolean;
  emailAddress: string;
  notificationSound: string;
  onEmailToggle: (checked: boolean) => void;
  onPushToggle: (checked: boolean) => void;
  onEmailChange: (email: string) => void;
  onSoundChange: (sound: string) => void;
}

const NotificationSettings = ({
  emailNotifications,
  pushNotifications,
  emailAddress,
  notificationSound,
  onEmailToggle,
  onPushToggle,
  onEmailChange,
  onSoundChange
}: NotificationSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Methods</CardTitle>
        <CardDescription>Configure how you want to receive alerts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="emailNotifications">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Send alert notifications to your email address
            </p>
          </div>
          <Switch
            id="emailNotifications"
            checked={emailNotifications}
            onCheckedChange={onEmailToggle}
          />
        </div>
        
        {emailNotifications && (
          <div className="pl-2 border-l-2 border-muted">
            <Label htmlFor="emailAddress" className="text-sm mb-1 block">
              Email Address
            </Label>
            <Input
              id="emailAddress"
              type="email"
              value={emailAddress}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="your@email.com"
              className="max-w-md"
            />
          </div>
        )}
        
        <div className="flex items-center justify-between pt-4">
          <div className="space-y-0.5">
            <Label htmlFor="pushNotifications">Push Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Show notifications on supported devices
            </p>
          </div>
          <Switch
            id="pushNotifications"
            checked={pushNotifications}
            onCheckedChange={onPushToggle}
          />
        </div>
        
        <div className="pt-4">
          <Label htmlFor="notificationSound" className="text-sm mb-1 block">
            Alert Sound
          </Label>
          <Select 
            value={notificationSound} 
            onValueChange={onSoundChange}
          >
            <SelectTrigger id="notificationSound" className="max-w-md">
              <SelectValue placeholder="Select alert sound" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="bell">Bell</SelectItem>
              <SelectItem value="chime">Chime</SelectItem>
              <SelectItem value="alert">Alert</SelectItem>
              <SelectItem value="none">None (Silent)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
