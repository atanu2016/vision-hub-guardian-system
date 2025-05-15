
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { SettingsSectionProps } from "./types";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { QualityType, ScheduleType } from "@/types/camera";

const RecordingSettings = ({ cameraData, handleChange, userRole, disabled = false }: SettingsSectionProps) => {
  const [activeTab, setActiveTab] = useState("settings");
  
  // Set default values for the recording settings if they don't exist
  const quality = cameraData.quality || "medium";
  const scheduleType = cameraData.scheduleType || "always";
  const timeStart = cameraData.timeStart || "00:00";
  const timeEnd = cameraData.timeEnd || "23:59";
  const daysOfWeek = cameraData.daysOfWeek || [];
  
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="bg-muted/50">
        <CardTitle className="text-xl">Recording Settings</CardTitle>
        <CardDescription>Configure recording options</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="settings">General</TabsTrigger>
            <TabsTrigger value="schedule">Recording Schedule</TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <Label htmlFor="recording" className="text-base font-medium">Enable Recording</Label>
                    <p className="text-sm text-muted-foreground mt-1">Record video footage from this camera</p>
                  </div>
                  <Switch
                    id="recording"
                    checked={!!cameraData.recording}
                    onCheckedChange={(checked) => handleChange('recording', checked)}
                    className="data-[state=checked]:bg-vision-blue"
                    disabled={disabled}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <Label htmlFor="motionDetection" className="text-base font-medium">Motion Detection</Label>
                    <p className="text-sm text-muted-foreground mt-1">Record only when motion is detected</p>
                  </div>
                  <Switch
                    id="motionDetection"
                    checked={!!cameraData.motionDetection}
                    onCheckedChange={(checked) => handleChange('motionDetection', checked)}
                    className="data-[state=checked]:bg-vision-blue"
                    disabled={disabled}
                  />
                </div>
                
                <div className="p-4 rounded-lg border border-border">
                  <Label htmlFor="quality" className="text-base font-medium">Recording Quality</Label>
                  <p className="text-sm text-muted-foreground mt-1 mb-3">Select the quality level for recordings</p>
                  <Select 
                    value={quality}
                    onValueChange={(value: QualityType) => handleChange('quality', value)}
                    disabled={disabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (360p)</SelectItem>
                      <SelectItem value="medium">Medium (720p)</SelectItem>
                      <SelectItem value="high">High (1080p)</SelectItem>
                      <SelectItem value="ultra">Ultra HD (4K)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="bg-muted text-xs font-medium p-2">Preview</div>
                <div className="p-1 bg-vision-dark-900">
                  <AspectRatio ratio={16/9}>
                    {cameraData.status === 'online' ? (
                      <div className="w-full h-full bg-vision-dark-800 flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">Camera Preview</p>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-vision-dark-800 flex items-center justify-center">
                        <Skeleton className="w-full h-full" />
                      </div>
                    )}
                  </AspectRatio>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="schedule" className="space-y-6">
            <div className="p-4 rounded-lg border border-border">
              <Label htmlFor="scheduleType" className="text-base font-medium">Recording Schedule Type</Label>
              <p className="text-sm text-muted-foreground mt-1 mb-3">When should recording be active</p>
              <Select 
                value={scheduleType}
                onValueChange={(value: ScheduleType) => handleChange('scheduleType', value)}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select schedule type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="always">Always (24/7)</SelectItem>
                  <SelectItem value="workdays">Workdays (Mon-Fri)</SelectItem>
                  <SelectItem value="weekends">Weekends (Sat-Sun)</SelectItem>
                  <SelectItem value="custom">Custom Schedule</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {scheduleType === 'custom' && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-border">
                  <h3 className="text-base font-medium mb-2">Custom Recording Hours</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="timeStart">Start Time</Label>
                      <Select 
                        value={timeStart}
                        onValueChange={(value) => handleChange('timeStart', value)}
                        disabled={disabled}
                      >
                        <SelectTrigger id="timeStart">
                          <SelectValue placeholder="Start time" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }).map((_, hour) => (
                            <SelectItem key={`hour-${hour}`} value={`${hour.toString().padStart(2, '0')}:00`}>
                              {hour.toString().padStart(2, '0')}:00
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="timeEnd">End Time</Label>
                      <Select 
                        value={timeEnd}
                        onValueChange={(value) => handleChange('timeEnd', value)}
                        disabled={disabled}
                      >
                        <SelectTrigger id="timeEnd">
                          <SelectValue placeholder="End time" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }).map((_, hour) => (
                            <SelectItem key={`hour-${hour}`} value={`${hour.toString().padStart(2, '0')}:00`}>
                              {hour.toString().padStart(2, '0')}:00
                            </SelectItem>
                          ))}
                          <SelectItem value="23:59">23:59</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg border border-border">
                  <h3 className="text-base font-medium mb-2">Days of Week</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                      <div key={day} className="flex flex-col items-center">
                        <div className="mb-1">{day}</div>
                        <Switch 
                          checked={daysOfWeek.includes(day.toLowerCase())}
                          onCheckedChange={(checked) => {
                            const days = [...(daysOfWeek || [])];
                            const dayLower = day.toLowerCase();
                            
                            if (checked && !days.includes(dayLower)) {
                              days.push(dayLower);
                            } else if (!checked && days.includes(dayLower)) {
                              const index = days.indexOf(dayLower);
                              days.splice(index, 1);
                            }
                            
                            handleChange('daysOfWeek', days);
                          }}
                          disabled={disabled}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RecordingSettings;
