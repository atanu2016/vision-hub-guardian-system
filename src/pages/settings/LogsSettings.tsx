
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Download, RefreshCw, AlertTriangle, Info, CheckCircle, X } from "lucide-react";
import { Input } from '@/components/ui/input';
import { getLogs, saveAdvancedSettings, getAdvancedSettings } from '@/services/apiService';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  source: string;
  details?: string;
}

const LogsSettings = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [filter, setFilter] = useState({
    level: 'all',
    source: 'all',
    search: ''
  });
  const [logSettings, setLogSettings] = useState({
    logRetentionDays: 30,
    minLogLevel: 'info'
  });

  // Fetch logs from the database
  const fetchLogs = async () => {
    setIsLoading(true);
    
    try {
      const data = await getLogs(filter);
      setLogs(data);
      toast("Logs Refreshed", {
        description: `Loaded ${data.length} log entries`
      });
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      toast("Error", {
        description: 'Could not retrieve system logs. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load logs and log settings on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load logs
        await fetchLogs();
        
        // Load log settings
        const advancedSettings = await getAdvancedSettings();
        setLogSettings({
          logRetentionDays: advancedSettings.logRetentionDays,
          minLogLevel: advancedSettings.minLogLevel
        });
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);

  const filteredLogs = logs.filter(log => {
    const levelMatch = filter.level === 'all' || log.level === filter.level;
    const sourceMatch = filter.source === 'all' || log.source === filter.source;
    const searchMatch = !filter.search || 
      log.message.toLowerCase().includes(filter.search.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(filter.search.toLowerCase()));
    
    return levelMatch && sourceMatch && searchMatch;
  });

  const handleDownloadLogs = () => {
    const content = filteredLogs.map(log => 
      `[${new Date(log.timestamp).toLocaleString()}] [${log.level.toUpperCase()}] [${log.source}] ${log.message} ${log.details ? '- ' + log.details : ''}`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system_logs_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast("Logs Downloaded", {
      description: 'System logs have been downloaded to your computer.'
    });
  };
  
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
      
      toast("Settings Saved", {
        description: "Log settings have been updated successfully"
      });
    } catch (error) {
      console.error('Error saving log settings:', error);
      toast("Error", {
        description: "Failed to save log settings"
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const getLevelIcon = (level: string) => {
    switch(level) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4" />;
    }
  };
  
  const getLevelBadge = (level: string) => {
    switch(level) {
      case 'error': return <Badge variant="destructive">Error</Badge>;
      case 'warning': return <Badge className="bg-amber-500">Warning</Badge>;
      case 'info': return <Badge className="bg-blue-500">Info</Badge>;
      default: return <Badge>Unknown</Badge>;
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
              <CardTitle>Log Viewer</CardTitle>
              <CardDescription>
                Browse system events and messages
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchLogs} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" onClick={handleDownloadLogs} disabled={filteredLogs.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/3">
              <Select 
                value={filter.level}
                onValueChange={value => setFilter({...filter, level: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-1/3">
              <Select 
                value={filter.source}
                onValueChange={value => setFilter({...filter, source: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="camera">Camera</SelectItem>
                  <SelectItem value="storage">Storage</SelectItem>
                  <SelectItem value="auth">Authentication</SelectItem>
                  <SelectItem value="backup">Backup</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-1/3">
              <Input
                placeholder="Search logs..."
                value={filter.search}
                onChange={e => setFilter({...filter, search: e.target.value})}
              />
            </div>
          </div>
          
          <div className="border rounded-md overflow-hidden">
            <div className="max-h-[500px] overflow-y-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading logs...</p>
                </div>
              ) : filteredLogs.length > 0 ? (
                <table className="min-w-full">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Time</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Level</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Source</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-muted">
                    {filteredLogs.map(log => (
                      <tr key={log.id} className="hover:bg-muted/30">
                        <td className="px-4 py-2 text-xs">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center">
                            {getLevelBadge(log.level)}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-sm capitalize">
                          {log.source}
                        </td>
                        <td className="px-4 py-2">
                          <div className="text-sm">{log.message}</div>
                          {log.details && (
                            <div className="text-xs text-muted-foreground mt-1">{log.details}</div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No logs match your filter criteria</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <p>Showing {filteredLogs.length} of {logs.length} logs</p>
          <p>Log retention: {logSettings.logRetentionDays} days</p>
        </CardFooter>
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
