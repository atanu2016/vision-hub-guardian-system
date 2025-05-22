
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface NotificationSettingsProps {
  emailNotifications: boolean;
  pushNotifications: boolean;
  emailAddress: string;
  notificationSound: string;
  onEmailNotifChange: (checked: boolean) => void;
  onPushNotifChange: (checked: boolean) => void;
  onEmailAddressChange: (email: string) => void;
  onSoundChange: (sound: string) => void;
}

const NotificationSettings = ({
  emailNotifications,
  pushNotifications,
  emailAddress,
  notificationSound,
  onEmailNotifChange,
  onPushNotifChange,
  onEmailAddressChange,
  onSoundChange
}: NotificationSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>
          Configure how you want to receive alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="emailNotifications">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive email alerts for important events
            </p>
          </div>
          <Switch 
            id="emailNotifications"
            checked={emailNotifications}
            onCheckedChange={onEmailNotifChange}
          />
        </div>
        
        {emailNotifications && (
          <div className="space-y-2">
            <Label htmlFor="emailAddress">Email Address</Label>
            <Input
              id="emailAddress"
              type="email"
              value={emailAddress}
              onChange={(e) => onEmailAddressChange(e.target.value)}
              placeholder="your@email.com"
            />
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="pushNotifications">Push Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive push notifications in your browser
            </p>
          </div>
          <Switch 
            id="pushNotifications"
            checked={pushNotifications}
            onCheckedChange={onPushNotifChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notificationSound">Notification Sound</Label>
          <Select
            value={notificationSound}
            onValueChange={onSoundChange}
          >
            <SelectTrigger id="notificationSound">
              <SelectValue placeholder="Select notification sound" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
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
