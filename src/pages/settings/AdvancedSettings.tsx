
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MFAEnrollment from '@/components/settings/security/MFAEnrollment';
import FirewallSettings from '@/components/settings/security/FirewallSettings';
import DebugLogDialog from '@/components/settings/DebugLogDialog';
import { Button } from '@/components/ui/button';
import { Loader2, Bug, Server, Settings } from 'lucide-react';

// Interface for server statistics
interface ServerStats {
  cpuUsage: number;
  memoryUsage: number;
  diskSpace: number;
  uptime: string;
  activeConnections: number;
}

export default function AdvancedSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [serverStats, setServerStats] = useState<ServerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [debugLogOpen, setDebugLogOpen] = useState(false);

  // Fetch server statistics
  useEffect(() => {
    if (activeTab === 'general') {
      // In a real implementation, this would call an API
      // This is a mock implementation for demonstration
      const fetchServerStats = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
          setServerStats({
            cpuUsage: Math.floor(Math.random() * 60) + 10, // 10-70%
            memoryUsage: Math.floor(Math.random() * 50) + 20, // 20-70%
            diskSpace: Math.floor(Math.random() * 80) + 10, // 10-90%
            uptime: `${Math.floor(Math.random() * 30) + 1} days, ${Math.floor(Math.random() * 24)} hours`,
            activeConnections: Math.floor(Math.random() * 100) + 1,
          });
          setIsLoading(false);
        }, 800);
      };

      fetchServerStats();
      // Refresh stats every 30 seconds
      const intervalId = setInterval(fetchServerStats, 30000);
      
      return () => clearInterval(intervalId);
    }
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Advanced Settings</h1>
        <p className="text-muted-foreground">
          Configure system security and advanced options
        </p>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="debugging">Debugging</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Server Settings</CardTitle>
              <CardDescription>Configure server and network options</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="ml-3 text-muted-foreground">Loading server statistics...</span>
                </div>
              ) : serverStats ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-lg border border-border">
                      <div className="text-sm font-medium text-muted-foreground mb-2">CPU Usage</div>
                      <div className="flex items-center">
                        <div className="text-2xl font-bold">{serverStats.cpuUsage}%</div>
                        <div className="ml-2 w-full max-w-xs bg-secondary rounded-full h-2">
                          <div 
                            className="bg-vision-blue h-2 rounded-full" 
                            style={{ width: `${serverStats.cpuUsage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg border border-border">
                      <div className="text-sm font-medium text-muted-foreground mb-2">Memory Usage</div>
                      <div className="flex items-center">
                        <div className="text-2xl font-bold">{serverStats.memoryUsage}%</div>
                        <div className="ml-2 w-full max-w-xs bg-secondary rounded-full h-2">
                          <div 
                            className="bg-vision-blue h-2 rounded-full" 
                            style={{ width: `${serverStats.memoryUsage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 rounded-lg border border-border">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Disk Space</div>
                      <div className="text-xl font-bold">{serverStats.diskSpace}% used</div>
                    </div>
                    
                    <div className="p-4 rounded-lg border border-border">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Uptime</div>
                      <div className="text-xl font-bold">{serverStats.uptime}</div>
                    </div>
                    
                    <div className="p-4 rounded-lg border border-border">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Active Connections</div>
                      <div className="text-xl font-bold">{serverStats.activeConnections}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-sm text-muted-foreground">
                    <p>Server statistics are updated every 30 seconds. Last updated: {new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Unable to load server statistics</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <FirewallSettings />
          <MFAEnrollment />
        </TabsContent>
        
        <TabsContent value="debugging" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center">
                  <Bug className="mr-2 h-5 w-5" />
                  Debug Options
                </CardTitle>
                <CardDescription>System logs and diagnostic information</CardDescription>
              </div>
              <Button onClick={() => setDebugLogOpen(true)}>
                View System Logs
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-secondary/30 rounded-md p-4">
                  <h3 className="text-sm font-medium mb-2">System Logs</h3>
                  <p className="text-sm text-muted-foreground">
                    View real-time system logs to diagnose issues and monitor system events.
                    Click "View System Logs" to open the log viewer.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium mb-2">Log Settings</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Log Level</span>
                        <select className="text-sm border rounded px-2 py-1">
                          <option value="debug">Debug</option>
                          <option value="info">Info</option>
                          <option value="warn">Warning</option>
                          <option value="error">Error</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Log Retention</span>
                        <select className="text-sm border rounded px-2 py-1">
                          <option value="7">7 Days</option>
                          <option value="14">14 Days</option>
                          <option value="30">30 Days</option>
                          <option value="90">90 Days</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium mb-2">Advanced Debug</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Debug Mode</span>
                        <Button variant="outline" size="sm">Enable</Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Diagnostic Report</span>
                        <Button variant="outline" size="sm">Generate</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <DebugLogDialog open={debugLogOpen} onOpenChange={setDebugLogOpen} />
    </div>
  );
}
