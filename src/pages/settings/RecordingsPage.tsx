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

const RecordingsPage = () => {
  const { toast } = useToast();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [recordingSchedule, setRecordingSchedule] = useState({
    continuous: true,
    motionDetection: true,
    schedule: "always", // always, custom
    timeStart: "00:00",
    timeEnd: "23:59",
    daysOfWeek: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    quality: "medium" // low, medium, high
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
    // In a real app, this would save to a backend service
    toast({
      title: "Settings Saved",
      description: "Recording settings have been updated successfully"
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recording Settings</h1>
          <p className="text-muted-foreground">
            Configure when and how cameras should record footage
          </p>
        </div>
        
        <Tabs defaultValue="settings">
          <TabsList>
            <TabsTrigger value="settings">Recording Settings</TabsTrigger>
            <TabsTrigger value="schedules">Recording Schedules</TabsTrigger>
            <TabsTrigger value="history">Recording History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recording Mode</CardTitle>
                <CardDescription>
                  Configure how cameras record footage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="continuous">Continuous Recording</Label>
                    <p className="text-sm text-muted-foreground">
                      Record continuously regardless of motion
                    </p>
                  </div>
                  <Switch 
                    id="continuous"
                    checked={recordingSchedule.continuous}
                    onCheckedChange={(checked) => 
                      setRecordingSchedule(prev => ({ ...prev, continuous: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="motionDetection">Motion Detection</Label>
                    <p className="text-sm text-muted-foreground">
                      Only record when motion is detected
                    </p>
                  </div>
                  <Switch 
                    id="motionDetection"
                    checked={recordingSchedule.motionDetection}
                    onCheckedChange={(checked) => 
                      setRecordingSchedule(prev => ({ ...prev, motionDetection: checked }))
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quality">Recording Quality</Label>
                  <Select
                    value={recordingSchedule.quality}
                    onValueChange={(value) => 
                      setRecordingSchedule(prev => ({ ...prev, quality: value }))
                    }
                  >
                    <SelectTrigger id="quality">
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (SD)</SelectItem>
                      <SelectItem value="medium">Medium (HD)</SelectItem>
                      <SelectItem value="high">High (4K)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSaveSettings}>Save Settings</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Camera Recording Status</CardTitle>
                <CardDescription>
                  Enable or disable recording for individual cameras
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
                      <Switch 
                        checked={camera.recording || false}
                        // In a real app, this would update the camera's recording state
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No cameras found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="schedules" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recording Schedule</CardTitle>
                <CardDescription>
                  Set when cameras should record
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Schedule Type</Label>
                    <Select
                      value={recordingSchedule.schedule}
                      onValueChange={(value) => 
                        setRecordingSchedule(prev => ({ ...prev, schedule: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select schedule type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="always">Always (24/7)</SelectItem>
                        <SelectItem value="custom">Custom Schedule</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {recordingSchedule.schedule === "custom" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="timeStart">Start Time</Label>
                          <Input
                            id="timeStart"
                            type="time"
                            value={recordingSchedule.timeStart}
                            onChange={(e) => 
                              setRecordingSchedule(prev => ({ ...prev, timeStart: e.target.value }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="timeEnd">End Time</Label>
                          <Input
                            id="timeEnd"
                            type="time"
                            value={recordingSchedule.timeEnd}
                            onChange={(e) => 
                              setRecordingSchedule(prev => ({ ...prev, timeEnd: e.target.value }))
                            }
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Days of Week</Label>
                        <div className="grid grid-cols-7 gap-2">
                          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                            <Button
                              key={day}
                              variant="outline"
                              className={`${
                                recordingSchedule.daysOfWeek.includes(day.toLowerCase()) 
                                  ? "bg-primary text-primary-foreground" 
                                  : ""
                              }`}
                              // In a real app, this would toggle the day in the daysOfWeek array
                            >
                              {day}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSaveSettings}>Save Schedule</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recording History</CardTitle>
                <CardDescription>
                  View and manage your recordings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cameras.length > 0 ? (
                  <p className="text-muted-foreground">Recording history will be displayed here</p>
                ) : (
                  <p className="text-muted-foreground">No cameras found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default RecordingsPage;
