import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getCameras } from "@/data/mockData";
import { Camera } from "@/types/camera";
import { Bell, BellOff } from "lucide-react";

const AlertsPage = () => {
  const { toast } = useToast();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [alertSettings, setAlertSettings] = useState({
    motionDetection: true,
    cameraOffline: true,
    storageWarning: true,
    emailNotifications: true,
    pushNotifications: false,
    emailAddress: "",
    notificationSound: "default",
  });

  useEffect(() => {
    const loadCameras = async () => {
      try {
        const loadedCameras = await getCameras();
        setCameras(loadedCameras);
      } catch (error) {
        console.error("Failed to load cameras:", error);
        setCameras([]);
      }
    };
    
    loadCameras();
  }, []);

  const handleSaveSettings = () => {
    // Basic email validation
    if (alertSettings.emailNotifications && !validateEmail(alertSettings.emailAddress)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would save to a backend service
    toast({
      title: "Settings Saved",
      description: "Alert settings have been updated successfully"
    });
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alert Settings</h1>
          <p className="text-muted-foreground">
            Configure alert notifications for your camera system
          </p>
        </div>
        
        <Tabs defaultValue="settings">
          <TabsList>
            <TabsTrigger value="settings">Alert Settings</TabsTrigger>
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
                <Button onClick={handleSaveSettings}>Save Settings</Button>
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
                          {Math.random() > 0.5 ? (
                            <Bell className="h-4 w-4" />
                          ) : (
                            <BellOff className="h-4 w-4" />
                          )}
                        </Button>
                        <Select defaultValue="all">
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
          
          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Alert History</CardTitle>
                <CardDescription>
                  View recent alerts from your cameras
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Alert history will be displayed here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AlertsPage;
