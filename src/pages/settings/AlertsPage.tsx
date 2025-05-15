import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { getCameras, getAlertSettings, saveAlertSettings } from "@/services/apiService";
import { Camera } from "@/types/camera";
import { Bell, BellOff } from "lucide-react";
import SMTPSettings from "@/components/settings/email/SMTPSettings";

interface AlertSettings {
  motionDetection: boolean;
  cameraOffline: boolean;
  storageWarning: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  emailAddress: string;
  notificationSound: string;
}

const AlertsPage = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("settings");
  
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    motionDetection: true,
    cameraOffline: true,
    storageWarning: true,
    emailNotifications: false,
    pushNotifications: false,
    emailAddress: "",
    notificationSound: "default"
  });

  // Load cameras and alert settings
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load cameras
        const loadedCameras = await getCameras();
        setCameras(loadedCameras);
        
        // Load alert settings
        const settings = await getAlertSettings();
        setAlertSettings(settings);
      } catch (error) {
        console.error("Failed to load data:", error);
        toast("Error", {
          description: "Failed to load alert settings"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleSaveSettings = async () => {
    // Basic email validation
    if (alertSettings.emailNotifications && !validateEmail(alertSettings.emailAddress)) {
      toast("Invalid Email", {
        description: "Please enter a valid email address"
      });
      return;
    }
    
    try {
      setSaving(true);
      
      // Save alert settings
      await saveAlertSettings(alertSettings);
      
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast("Error", {
        description: "Failed to save alert settings"
      });
    } finally {
      setSaving(false);
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  // Mock function for camera alert level changes
  // In a real app, this would update in your database
  const handleCameraAlertLevelChange = (cameraId: string, level: string) => {
    // This is a placeholder function
    // In a real implementation, update the camera alert settings
    toast("Alert Level Updated", {
      description: `Camera alert level set to ${level}`
    });
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4">Loading alert settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Alert Settings</h1>
        <p className="text-muted-foreground">
          Configure alert notifications for your camera system
        </p>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="settings">Alert Settings</TabsTrigger>
          <TabsTrigger value="email">Email Configuration</TabsTrigger>
          <TabsTrigger value="history">Alert History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings" className="space-y-6 mt-6">
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
                  checked={alertSettings.emailNotifications}
                  onCheckedChange={(checked) => 
                    setAlertSettings(prev => ({ ...prev, emailNotifications: checked }))
                  }
                />
              </div>
              
              {alertSettings.emailNotifications && (
                <div className="space-y-2">
                  <Label htmlFor="emailAddress">Email Address</Label>
                  <Input
                    id="emailAddress"
                    type="email"
                    value={alertSettings.emailAddress}
                    onChange={(e) => 
                      setAlertSettings(prev => ({ ...prev, emailAddress: e.target.value }))
                    }
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
                  checked={alertSettings.pushNotifications}
                  onCheckedChange={(checked) => 
                    setAlertSettings(prev => ({ ...prev, pushNotifications: checked }))
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notificationSound">Notification Sound</Label>
                <Select
                  value={alertSettings.notificationSound}
                  onValueChange={(value) => 
                    setAlertSettings(prev => ({ ...prev, notificationSound: value }))
                  }
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
          
          <Card>
            <CardHeader>
              <CardTitle>Alert Types</CardTitle>
              <CardDescription>
                Choose what events trigger alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="motionDetection">Motion Detection Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when motion is detected
                  </p>
                </div>
                <Switch 
                  id="motionDetection"
                  checked={alertSettings.motionDetection}
                  onCheckedChange={(checked) => 
                    setAlertSettings(prev => ({ ...prev, motionDetection: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="cameraOffline">Camera Offline Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when a camera goes offline
                  </p>
                </div>
                <Switch 
                  id="cameraOffline"
                  checked={alertSettings.cameraOffline}
                  onCheckedChange={(checked) => 
                    setAlertSettings(prev => ({ ...prev, cameraOffline: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="storageWarning">Storage Warning Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when storage is nearly full
                  </p>
                </div>
                <Switch 
                  id="storageWarning"
                  checked={alertSettings.storageWarning}
                  onCheckedChange={(checked) => 
                    setAlertSettings(prev => ({ ...prev, storageWarning: checked }))
                  }
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={handleSaveSettings}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Camera-Specific Alerts</CardTitle>
              <CardDescription>
                Configure alerts for individual cameras
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cameras.length > 0 ? (
                cameras.map(camera => (
                  <div key={camera.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium">{camera.name}</p>
                      <p className="text-sm text-muted-foreground">{camera.location}</p>
                    </div>
                    <div className="flex items-center">
                      <Button variant="ghost" size="icon" className="mr-2">
                        {camera.motionDetection ? (
                          <Bell className="h-4 w-4" />
                        ) : (
                          <BellOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Select 
                        defaultValue="all"
                        onValueChange={(value) => handleCameraAlertLevelChange(camera.id, value)}
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue placeholder="Alert level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Alerts</SelectItem>
                          <SelectItem value="motion">Motion Only</SelectItem>
                          <SelectItem value="offline">Offline Only</SelectItem>
                          <SelectItem value="none">No Alerts</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No cameras found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="email" className="space-y-6 mt-6">
          <SMTPSettings />
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert History</CardTitle>
              <CardDescription>
                View recent alerts from your cameras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 text-center">
                <p className="text-muted-foreground">Alert history will be implemented in a future update</p>
                <Button className="mt-4" variant="outline">Export Alert History</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AlertsPage;
