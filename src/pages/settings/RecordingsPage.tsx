import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { getCameras } from "@/services/apiService";
import { Camera } from "@/types/camera";
import { getRecordingSettings, saveRecordingSettings, saveCameraRecordingStatus } from "@/services/apiService";

interface RecordingSchedule {
  continuous: boolean;
  motionDetection: boolean;
  schedule: string;
  timeStart: string;
  timeEnd: string;
  daysOfWeek: string[];
  quality: string;
}

const RecordingsPage = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [recordingSchedule, setRecordingSchedule] = useState<RecordingSchedule>({
    continuous: true,
    motionDetection: true,
    schedule: "always",
    timeStart: "00:00",
    timeEnd: "23:59",
    daysOfWeek: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    quality: "medium"
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load cameras
        const loadedCameras = await getCameras();
        setCameras(loadedCameras);
        
        // Load recording settings
        const settings = await getRecordingSettings();
        setRecordingSchedule(settings);
      } catch (error) {
        console.error("Failed to load data:", error);
        toast({
          title: "Error",
          description: "Failed to load recording settings",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      // Save recording schedule
      await saveRecordingSettings(recordingSchedule);
      
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Error",
        description: "Failed to save recording settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleToggleCameraRecording = async (camera: Camera) => {
    try {
      // Update recording status
      const success = await saveCameraRecordingStatus(camera.id, !camera.recording);
      
      if (success) {
        // Update local state
        setCameras(cameras.map(c => 
          c.id === camera.id ? { ...c, recording: !c.recording } : c
        ));
        
        toast({
          title: "Camera Updated",
          description: `Recording ${!camera.recording ? 'enabled' : 'disabled'} for ${camera.name}`
        });
      }
    } catch (error) {
      console.error("Failed to update camera recording status:", error);
      toast({
        title: "Error",
        description: "Failed to update camera recording status",
        variant: "destructive"
      });
    }
  };

  const toggleDayOfWeek = (day: string) => {
    const lowercaseDay = day.toLowerCase();
    setRecordingSchedule(prev => {
      if (prev.daysOfWeek.includes(lowercaseDay)) {
        return {
          ...prev,
          daysOfWeek: prev.daysOfWeek.filter(d => d !== lowercaseDay)
        };
      } else {
        return {
          ...prev,
          daysOfWeek: [...prev.daysOfWeek, lowercaseDay]
        };
      }
    });
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4">Loading recording settings...</p>
      </div>
    );
  }

  return (
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
              <Button onClick={handleSaveSettings} disabled={saving}>
                {saving ? "Saving..." : "Save Settings"}
              </Button>
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
                      onCheckedChange={() => handleToggleCameraRecording(camera)}
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
                        {["sun", "mon", "tue", "wed", "thu", "fri", "sat"].map((day) => (
                          <Button
                            key={day}
                            type="button"
                            variant="outline"
                            className={`${
                              recordingSchedule.daysOfWeek.includes(day.toLowerCase()) 
                                ? "bg-primary text-primary-foreground" 
                                : ""
                            }`}
                            onClick={() => toggleDayOfWeek(day)}
                          >
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={handleSaveSettings}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Schedule"}
              </Button>
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
              <div className="p-6 text-center">
                <p className="text-muted-foreground">Recording history will be implemented in a future update</p>
                <Button className="mt-4" variant="outline">Export Recordings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecordingsPage;
