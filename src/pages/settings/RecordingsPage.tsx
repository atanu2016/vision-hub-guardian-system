
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RecordingCalendar from '@/components/recordings/RecordingCalendar';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function RecordingsPage() {
  const [activeTab, setActiveTab] = useState('settings');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Recording Settings</h1>
        <p className="text-muted-foreground">
          Configure when and how cameras should record footage
        </p>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="settings">Recording Settings</TabsTrigger>
          <TabsTrigger value="schedules">Recording Schedules</TabsTrigger>
          <TabsTrigger value="history">Recording History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>General Recording Settings</CardTitle>
              <CardDescription>Configure default recording options for all cameras</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <Label htmlFor="continuous" className="text-base font-medium">Continuous Recording</Label>
                  <p className="text-sm text-muted-foreground mt-1">Record video continuously from cameras</p>
                </div>
                <Switch
                  id="continuous"
                  defaultChecked
                  className="data-[state=checked]:bg-vision-blue"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <Label htmlFor="motionDetection" className="text-base font-medium">Motion Detection</Label>
                  <p className="text-sm text-muted-foreground mt-1">Record when motion is detected</p>
                </div>
                <Switch
                  id="motionDetection"
                  defaultChecked
                  className="data-[state=checked]:bg-vision-blue"
                />
              </div>
              
              <div className="p-4 rounded-lg border border-border">
                <Label htmlFor="quality" className="text-base font-medium">Default Recording Quality</Label>
                <p className="text-sm text-muted-foreground mt-1 mb-3">Select default quality for recordings</p>
                <Select defaultValue="medium">
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
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="schedules">
          <div className="p-6 text-center">
            <p>Recording schedules configuration will be implemented in a future update</p>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <RecordingCalendar />
        </TabsContent>
      </Tabs>
    </div>
  );
}
