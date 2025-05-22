
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { getLogs, saveAdvancedSettings, getAdvancedSettings } from '@/services/apiService';
import RealTimeLogsViewer from '@/components/settings/RealTimeLogsViewer';
import { Terminal } from 'lucide-react';

const LogsSettings = () => {
  const [savingSettings, setSavingSettings] = useState(false);
  const [logSettings, setLogSettings] = useState({
    logRetentionDays: 30,
    minLogLevel: 'info'
  });

  // Load log settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load log settings
        const advancedSettings = await getAdvancedSettings();
        setLogSettings({
          logRetentionDays: advancedSettings.logRetentionDays,
          minLogLevel: advancedSettings.minLogLevel
        });
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error("Failed to load log settings");
      }
    };
    
    loadSettings();
  }, []);
  
  const handleSaveLogSettings = async () => {
    try {
      setSavingSettings(true);
      
      // Get existing advanced settings
      const currentSettings = await getAdvancedSettings();
      
      // Update only log-related settings
      const updatedSettings = {
        ...currentSettings,
        logRetentionDays: logSettings.logRetentionDays,
        minLogLevel: logSettings.minLogLevel
      };
      
      // Save to database
      await saveAdvancedSettings(updatedSettings);
      
      toast.success("Log settings have been updated successfully");
    } catch (error) {
      console.error('Error saving log settings:', error);
      toast.error("Failed to save log settings");
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Logs</h1>
        <p className="text-muted-foreground">
          View and manage system logs for troubleshooting
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center">
                <Terminal className="mr-2 h-5 w-5" />
                Live Log Viewer
              </CardTitle>
              <CardDescription>
                View system logs in real-time
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RealTimeLogsViewer isOpen={true} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Log Management</CardTitle>
          <CardDescription>
            Configure logging behavior and retention
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Log Retention</p>
              <p className="text-sm text-muted-foreground">How long logs are kept</p>
            </div>
            <Select 
              value={logSettings.logRetentionDays.toString()}
              onValueChange={(value) => setLogSettings({...logSettings, logRetentionDays: parseInt(value)})}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select retention" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Minimum Log Level</p>
              <p className="text-sm text-muted-foreground">Only store logs at or above this severity</p>
            </div>
            <Select 
              value={logSettings.minLogLevel}
              onValueChange={(value) => setLogSettings({...logSettings, minLogLevel: value})}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select log level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="debug">Debug</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="ml-auto" 
            onClick={handleSaveLogSettings}
            disabled={savingSettings}
          >
            {savingSettings ? "Saving..." : "Save Log Settings"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LogsSettings;
