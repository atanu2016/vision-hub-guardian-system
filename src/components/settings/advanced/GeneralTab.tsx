
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getSystemStats } from "@/services/apiService";

interface GeneralTabProps {
  onSave: (settings: any) => void;
  settings: any;
  loading: boolean;
}

const GeneralTab = ({ onSave, settings, loading }: GeneralTabProps) => {
  const [systemStats, setSystemStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const stats = await getSystemStats();
        setSystemStats(stats);
      } catch (error) {
        console.error("Failed to fetch system stats", error);
        toast.error("Could not load system statistics");
      } finally {
        setStatsLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const handlePortChange = (value: string) => {
    if (!value || Number.isNaN(Number(value))) return;
    onSave({ ...settings, server_port: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>Overview of your system performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Storage Usage</Label>
              <p className="text-sm font-medium mt-1">
                {statsLoading ? 'Loading...' : systemStats ? 
                  `${systemStats.storage_used} of ${systemStats.storage_total} (${systemStats.storage_percentage}%)` : 
                  'Not available'}
              </p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">System Uptime</Label>
              <p className="text-sm font-medium mt-1">
                {statsLoading ? 'Loading...' : systemStats ? 
                  `${systemStats.uptime_hours} hours` : 
                  'Not available'}
              </p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Camera Count</Label>
              <p className="text-sm font-medium mt-1">
                {statsLoading ? 'Loading...' : systemStats ? 
                  `Total: ${systemStats.total_cameras}, Online: ${systemStats.online_cameras}, Recording: ${systemStats.recording_cameras}` : 
                  'Not available'}
              </p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">System Version</Label>
              <p className="text-sm font-medium mt-1">Vision Hub v1.0.0</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Server Settings</CardTitle>
          <CardDescription>Configure the server behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="serverPort">Server Port</Label>
              <Input
                id="serverPort"
                placeholder="8080"
                value={settings?.server_port || ''}
                onChange={e => handlePortChange(e.target.value)}
                className="max-w-[180px] mt-1.5"
              />
              <p className="text-sm text-muted-foreground mt-1.5">
                Port for the web server. Restart required after change.
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="debug" className="block mb-1.5">Debug Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable detailed logging and debugging tools
                </p>
              </div>
              <Switch 
                id="debug"
                checked={!!settings?.debug_mode}
                onCheckedChange={checked => onSave({ ...settings, debug_mode: checked })}
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="logLevel">Log Level</Label>
              <Select 
                value={settings?.log_level || 'info'}
                onValueChange={value => onSave({ ...settings, log_level: value })}
                disabled={loading}
              >
                <SelectTrigger id="logLevel" className="max-w-[180px] mt-1.5">
                  <SelectValue placeholder="Select log level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1.5">
                Level of detail for system logs
              </p>
            </div>
            
            <div>
              <Label htmlFor="logRetention">Log Retention (Days)</Label>
              <Input
                id="logRetention"
                type="number"
                placeholder="30"
                value={settings?.log_retention_days || '30'}
                onChange={e => onSave({ ...settings, log_retention_days: parseInt(e.target.value) })}
                className="max-w-[180px] mt-1.5"
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground mt-1.5">
                Number of days to keep system logs before automatic deletion
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>System Operations</CardTitle>
          <CardDescription>Maintenance operations for your system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline">
              Restart Service
            </Button>
            <Button variant="outline">
              Run System Diagnostics
            </Button>
            <Button variant="outline">
              Clear Cache
            </Button>
            <Button variant="outline">
              Export System Logs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralTab;
