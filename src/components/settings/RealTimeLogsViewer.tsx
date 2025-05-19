
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Check, XCircle, Info, Download, Terminal, Search } from 'lucide-react';
import { streamLogs } from '@/services/apiService';
import { toast } from "sonner";
import { Input } from '@/components/ui/input';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  source: string;
  details?: string;
}

interface RealTimeLogsViewerProps {
  isOpen: boolean;
}

const RealTimeLogsViewer = ({ isOpen }: RealTimeLogsViewerProps) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [filter, setFilter] = useState({
    level: 'all',
    source: 'all',
    search: ''
  });
  const [availableSources, setAvailableSources] = useState<string[]>(['system', 'camera', 'storage', 'auth', 'backup']);
  const streamCleanupRef = useRef<(() => void) | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Start/stop the log stream based on the isOpen prop
  useEffect(() => {
    if (isOpen) {
      startLogStream();
    } else {
      stopLogStream();
    }

    return () => {
      stopLogStream();
    };
  }, [isOpen, filter.level, filter.source]);

  // Filter logs client-side for search term
  const filteredLogs = logs.filter(log => {
    const searchMatch = !filter.search || 
      log.message.toLowerCase().includes(filter.search.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(filter.search.toLowerCase()));
    
    return searchMatch;
  });

  // Auto-scroll to the bottom when new logs come in
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [filteredLogs]);

  const startLogStream = async () => {
    try {
      stopLogStream(); // Clean up any existing stream
      
      setIsStreaming(true);
      toast.info("Connecting to log stream...");
      
      const cleanup = await streamLogs(
        filter.level, 
        filter.source, 
        (newLogs: LogEntry[]) => {
          setLogs(prevLogs => {
            // Merge logs (avoiding duplicates by ID)
            const logMap = new Map();
            [...prevLogs, ...newLogs].forEach(log => {
              logMap.set(log.id, log);
            });
            
            // Sort by timestamp (most recent last)
            return Array.from(logMap.values())
              .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
              .slice(-100); // Keep only the last 100 logs
          });
        }
      );
      
      streamCleanupRef.current = cleanup;
      toast.success("Connected to log stream");
    } catch (error) {
      console.error('Failed to start log stream:', error);
      setIsStreaming(false);
      toast.error("Failed to connect to log stream");
    }
  };

  const stopLogStream = () => {
    if (streamCleanupRef.current) {
      streamCleanupRef.current();
      streamCleanupRef.current = null;
      setIsStreaming(false);
    }
  };

  const toggleLogStream = () => {
    if (isStreaming) {
      stopLogStream();
      toast.info("Log stream paused");
    } else {
      startLogStream();
    }
  };

  const handleClearLogs = () => {
    setLogs([]);
    toast.info("Logs cleared");
  };

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
    
    toast.success('Logs have been downloaded');
  };
  
  const getLogIcon = (level: string) => {
    switch(level) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500 mr-2 shrink-0" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-amber-500 mr-2 shrink-0" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500 mr-2 shrink-0" />;
      case 'debug': return <Check className="h-4 w-4 text-green-500 mr-2 shrink-0" />;
      default: return <Info className="h-4 w-4 mr-2 shrink-0" />;
    }
  };
  
  const getLogClass = (level: string) => {
    switch(level) {
      case 'error': return 'text-red-500';
      case 'warning': return 'text-amber-500';
      case 'info': return 'text-blue-500';
      case 'debug': return 'text-green-500';
      default: return '';
    }
  };

  return (
    <div className="space-y-4">
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
              <SelectItem value="debug">Debug</SelectItem>
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
              {availableSources.map(source => (
                <SelectItem key={source} value={source}>
                  {source.charAt(0).toUpperCase() + source.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-1/3 relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={filter.search}
            onChange={e => setFilter({...filter, search: e.target.value})}
            className="pl-8"
          />
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-sm">Live streaming:</span>
          <div className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-sm">{isStreaming ? 'Active' : 'Paused'}</span>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={toggleLogStream}>
            {isStreaming ? 'Pause' : 'Start'} Stream
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadLogs} disabled={filteredLogs.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearLogs} disabled={logs.length === 0}>
            Clear
          </Button>
        </div>
      </div>
      
      <div className="border rounded-md">
        <ScrollArea className="h-[350px] w-full" ref={scrollAreaRef}>
          {filteredLogs.length > 0 ? (
            <div className="p-4 space-y-2">
              {filteredLogs.map((log, index) => (
                <div key={log.id} className="flex text-sm border-b pb-2 last:border-0">
                  {getLogIcon(log.level)}
                  <div>
                    <div className="flex items-center">
                      <span className={`font-mono font-medium ${getLogClass(log.level)}`}>
                        [{log.level.toUpperCase()}]
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="ml-2 text-xs px-1.5 py-0.5 bg-muted rounded-sm">
                        {log.source}
                      </span>
                    </div>
                    <p className="mt-1">{log.message}</p>
                    {log.details && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{log.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <Terminal className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No logs available</p>
              {!isStreaming && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={startLogStream}
                >
                  Connect to Log Stream
                </Button>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default RealTimeLogsViewer;
