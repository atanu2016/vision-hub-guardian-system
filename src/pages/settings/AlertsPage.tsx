
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const AlertsPage = () => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [motionAlerts, setMotionAlerts] = useState(true);
  const [cameraOfflineAlerts, setCameraOfflineAlerts] = useState(true);
  const [storageAlerts, setStorageAlerts] = useState(true);
  const [emailAddress, setEmailAddress] = useState('admin@example.com');
  const [alertFrequency, setAlertFrequency] = useState('immediate');

  const handleSaveSettings = () => {
    toast.success('Alert settings saved successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Alert Settings</h1>
        <p className="text-muted-foreground">
          Configure notifications for motion detection, camera status, and system events
        </p>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications">Notification Types</TabsTrigger>
          <TabsTrigger value="delivery">Delivery Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert Types</CardTitle>
              <CardDescription>Choose which events should trigger alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <Label htmlFor="motion-alerts" className="text-base font-medium">Motion Detection</Label>
                  <p className="text-sm text-muted-foreground mt-1">Alert when motion is detected by cameras</p>
                </div>
                <Switch
                  id="motion-alerts"
                  checked={motionAlerts}
                  onCheckedChange={setMotionAlerts}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <Label htmlFor="camera-offline" className="text-base font-medium">Camera Offline</Label>
                  <p className="text-sm text-muted-foreground mt-1">Alert when cameras go offline or lose connection</p>
                </div>
                <Switch
                  id="camera-offline"
                  checked={cameraOfflineAlerts}
                  onCheckedChange={setCameraOfflineAlerts}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <Label htmlFor="storage-alerts" className="text-base font-medium">Storage Warnings</Label>
                  <p className="text-sm text-muted-foreground mt-1">Alert when storage space is running low</p>
                </div>
                <Switch
                  id="storage-alerts"
                  checked={storageAlerts}
                  onCheckedChange={setStorageAlerts}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Methods</CardTitle>
              <CardDescription>Configure how you want to receive alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <Label htmlFor="email-alerts" className="text-base font-medium">Email Alerts</Label>
                  <p className="text-sm text-muted-foreground mt-1">Send alerts via email</p>
                </div>
                <Switch
                  id="email-alerts"
                  checked={emailAlerts}
                  onCheckedChange={setEmailAlerts}
                />
              </div>

              {emailAlerts && (
                <div className="pl-4 space-y-4">
                  <div>
                    <Label htmlFor="email-address">Email Address</Label>
                    <Input
                      id="email-address"
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="alert-frequency">Alert Frequency</Label>
                    <Select value={alertFrequency} onValueChange={setAlertFrequency}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="hourly">Hourly Summary</SelectItem>
                        <SelectItem value="daily">Daily Summary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <Label htmlFor="push-notifications" className="text-base font-medium">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground mt-1">Send browser push notifications</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings}>Save Alert Settings</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AlertsPage;
