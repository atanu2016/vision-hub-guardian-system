
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface DebugLogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  details?: any;
}

interface DebugLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DebugLogDialog = ({ open, onOpenChange }: DebugLogDialogProps) => {
  const [logs, setLogs] = useState<DebugLogEntry[]>([]);
  const [filterText, setFilterText] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (open) {
      // Fetch logs from console history and localStorage
      const fetchLogs = () => {
        // Get logs from storage
        const storedLogs = localStorage.getItem('debug-logs');
        const parsedLogs: DebugLogEntry[] = storedLogs ? JSON.parse(storedLogs) : [];
        
        // Get recent console logs from memory
        // This is a simplified example - in a real app, you'd have a more robust logging system
        const recentConsoleLogs = [
          { timestamp: new Date().toISOString(), level: 'info', message: 'System initialized with public cameras' },
          { timestamp: new Date().toISOString(), level: 'debug', message: 'HLS.js initialized with streams' },
          { timestamp: new Date().toISOString(), level: 'info', message: 'Loading cameras from local storage' },
          { timestamp: new Date().toISOString(), level: 'debug', message: 'Stream URLs validated' },
          { timestamp: new Date().toISOString(), level: 'error', message: 'Failed to connect to some camera streams' },
        ] as DebugLogEntry[];
        
        // Combine and sort logs
        const combinedLogs = [...parsedLogs, ...recentConsoleLogs].sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        setLogs(combinedLogs);
      };
      
      fetchLogs();
    }
  }, [open]);

  const filteredLogs = logs.filter(log => {
    // Filter by tab
    if (activeTab !== 'all' && log.level !== activeTab) return false;
    
    // Filter by search text
    if (filterText && !log.message.toLowerCase().includes(filterText.toLowerCase())) return false;
    
    return true;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-600 text-white';
      case 'warning': return 'bg-yellow-500 text-black';
      case 'info': return 'bg-blue-500 text-white';
      case 'debug': return 'bg-gray-500 text-white';
      default: return 'bg-gray-300 text-black';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Debug Logs</DialogTitle>
          <DialogDescription>
            System logs for troubleshooting and diagnostics
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Filter logs..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="flex-1"
            />
          </div>
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Logs</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="warning">Warnings</TabsTrigger>
              <TabsTrigger value="error">Errors</TabsTrigger>
              <TabsTrigger value="debug">Debug</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <ScrollArea className="h-[50vh] border rounded-md p-2">
            {filteredLogs.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No logs matching your criteria
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLogs.map((log, i) => (
                  <div key={i} className="p-2 border rounded-md hover:bg-accent">
                    <div className="flex items-center justify-between mb-1">
                      <Badge className={getLevelColor(log.level)}>
                        {log.level.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{log.message}</p>
                    {log.details && (
                      <pre className="text-xs mt-2 p-2 bg-muted rounded text-muted-foreground overflow-auto">
                        {typeof log.details === 'object' 
                          ? JSON.stringify(log.details, null, 2) 
                          : log.details}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              // Clear logs from storage
              localStorage.removeItem('debug-logs');
              setLogs([]);
            }}
          >
            Clear Logs
          </Button>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DebugLogDialog;
