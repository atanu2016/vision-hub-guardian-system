
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check, XCircle, Info, Download } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { addLog } from '@/services/apiService';

interface DebugLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface LogEntry {
  timestamp: string;
  level: 'info' | 'error' | 'warn' | 'debug';
  message: string;
}

const DebugLogDialog = ({ open, onOpenChange }: DebugLogDialogProps) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [intervalId, setIntervalId] = useState<number | null>(null);

  // Generate mock debug logs when the dialog opens
  useEffect(() => {
    if (open) {
      generateMockLogs();
      
      // Start polling for logs
      startPolling();
    } else {
      // Stop polling when dialog is closed
      stopPolling();
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [open]);

  const startPolling = () => {
    if (!isPolling) {
      const id = setInterval(() => {
        // Add a new random log entry every few seconds
        const logTypes = ['info', 'warn', 'error', 'debug'] as const;
        const randomLevel = logTypes[Math.floor(Math.random() * logTypes.length)];
        const randomMessages = [
          'Checking camera stream status',
          'Storage usage analyzed',
          'Background task completed',
          'API request completed',
          'Configuration validated',
          'Camera stream buffer processed',
          'Memory usage optimized'
        ];
        const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];
        
        const newLog = {
          timestamp: new Date().toISOString(),
          level: randomLevel,
          message: randomMessage
        };
        
        setLogs(prevLogs => [newLog, ...prevLogs].slice(0, 100));
      }, 3000) as unknown as number;
      
      setIntervalId(id);
      setIsPolling(true);
    }
  };
  
  const stopPolling = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
      setIsPolling(false);
    }
  };

  const generateMockLogs = async () => {
    const initialLogs: LogEntry[] = [
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Debug mode activated'
      },
      {
        timestamp: new Date(Date.now() - 1000).toISOString(),
        level: 'debug',
        message: 'System configuration loaded'
      },
      {
        timestamp: new Date(Date.now() - 2000).toISOString(),
        level: 'info',
        message: 'Storage usage: 45.2%'
      },
      {
        timestamp: new Date(Date.now() - 3000).toISOString(),
        level: 'debug',
        message: 'Camera stream buffer size: 8192 bytes'
      },
      {
        timestamp: new Date(Date.now() - 5000).toISOString(),
        level: 'warn',
        message: 'Network latency detected: 350ms'
      }
    ];
    
    setLogs(initialLogs);
    
    // Add a log entry to the database
    await addLog('info', 'Debug console opened', 'system', 'User opened debug console');
  };

  const handleDownloadLogs = () => {
    const content = logs.map(log => 
      `[${new Date(log.timestamp).toLocaleString()}] [${log.level.toUpperCase()}] ${log.message}`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `debug_logs_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  const getLogIcon = (level: string) => {
    switch(level) {
      case 'error': 
        return <XCircle className="h-4 w-4 text-red-500 mr-2 shrink-0" />;
      case 'warn': 
        return <AlertCircle className="h-4 w-4 text-amber-500 mr-2 shrink-0" />;
      case 'info': 
        return <Info className="h-4 w-4 text-blue-500 mr-2 shrink-0" />;
      case 'debug':
        return <Check className="h-4 w-4 text-green-500 mr-2 shrink-0" />;
      default: 
        return <Info className="h-4 w-4 mr-2 shrink-0" />;
    }
  };
  
  const getLogClass = (level: string) => {
    switch(level) {
      case 'error': return 'text-red-500';
      case 'warn': return 'text-amber-500';
      case 'info': return 'text-blue-500';
      case 'debug': return 'text-green-500';
      default: return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Debug Console</DialogTitle>
          <DialogDescription>
            Live system debug information
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-between items-center my-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm">Auto-refresh:</span>
            <div className={`w-3 h-3 rounded-full ${isPolling ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-sm">{isPolling ? 'Active' : 'Inactive'}</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleDownloadLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>
        
        <div className="border rounded-md">
          <ScrollArea className="h-[350px] w-full">
            {logs.length > 0 ? (
              <div className="p-4 space-y-2">
                {logs.map((log, index) => (
                  <div key={index} className="flex text-sm border-b pb-2 last:border-0">
                    {getLogIcon(log.level)}
                    <div>
                      <div className="flex items-center">
                        <span className={`font-mono font-medium ${getLogClass(log.level)}`}>
                          [{log.level.toUpperCase()}]
                        </span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="mt-1">{log.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No debug logs available</p>
              </div>
            )}
          </ScrollArea>
        </div>
        
        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={() => setLogs([])}>
            Clear Logs
          </Button>
          <Button variant="default" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DebugLogDialog;
