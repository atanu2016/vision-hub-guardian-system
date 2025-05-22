
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DownloadCloud } from "lucide-react";
import RealTimeLogsViewer from "@/components/settings/RealTimeLogsViewer";
import DebugLogDialog from "@/components/settings/DebugLogDialog";
import { useToast } from "@/hooks/use-toast";

const LogSettings = () => {
  const [logLevel, setLogLevel] = useState<string>("info");
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState<boolean>(false);
  const { toast } = useToast();

  const handleExportLogs = async () => {
    toast({
      title: "Exporting logs...",
      description: "Your logs will be downloaded shortly"
    });
    // In a real application, you would implement the actual log export functionality here
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Logs</h1>
        <p className="text-muted-foreground">
          View and manage system logs for troubleshooting
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Label>Log Level</Label>
          <Select value={logLevel} onValueChange={setLogLevel}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select log level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="debug">Debug</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Label>Auto Refresh</Label>
            <Switch 
              checked={autoRefresh} 
              onCheckedChange={setAutoRefresh} 
            />
          </div>
          
          <Button onClick={handleExportLogs} variant="outline">
            <DownloadCloud className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
          
          <Button onClick={() => setIsFullScreenOpen(true)}>
            View Full Screen
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
          <TabsTrigger value="settings">Log Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <RealTimeLogsViewer logLevel={logLevel} autoRefresh={autoRefresh} isOpen={true} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>
                Track user activities and system changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Audit logs track who did what and when. This helps with security compliance and troubleshooting.
              </p>
              <div className="mt-4 text-center py-8">
                <p className="text-muted-foreground">Audit logging functionality coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Log Settings</CardTitle>
              <CardDescription>
                Configure logging behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Log Retention Period</Label>
                    <Select defaultValue="30">
                      <SelectTrigger>
                        <SelectValue placeholder="Select retention period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 Days</SelectItem>
                        <SelectItem value="14">14 Days</SelectItem>
                        <SelectItem value="30">30 Days</SelectItem>
                        <SelectItem value="90">90 Days</SelectItem>
                        <SelectItem value="365">1 Year</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Logs older than this will be automatically deleted
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>System Events to Log</Label>
                    <div className="space-y-2 mt-2">
                      {['User logins', 'Configuration changes', 'Camera events', 'Storage alerts'].map(event => (
                        <div key={event} className="flex items-center space-x-2">
                          <Checkbox id={event.replace(/\s+/g, '-').toLowerCase()} defaultChecked />
                          <label htmlFor={event.replace(/\s+/g, '-').toLowerCase()} className="text-sm">
                            {event}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <DebugLogDialog 
        open={isFullScreenOpen} 
        onOpenChange={setIsFullScreenOpen} 
      />
    </div>
  );
};

// Helper components to avoid component imports
const Label = ({ children, htmlFor }: { children: React.ReactNode, htmlFor?: string }) => (
  <label htmlFor={htmlFor} className="text-sm font-medium">
    {children}
  </label>
);

const Checkbox = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    type="checkbox"
    {...props}
    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
  />
);

export default LogSettings;
