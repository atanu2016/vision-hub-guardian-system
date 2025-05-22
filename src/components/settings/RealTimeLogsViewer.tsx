
// Import the necessary components and hooks
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Clock, Database, Search, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

interface LogEntry {
  id: string;
  level: string;
  message: string;
  source: string;
  timestamp: string;
  details?: string;
}

interface RealTimeLogsViewerProps {
  logLevel?: string;
  autoRefresh?: boolean;
}

const RealTimeLogsViewer = ({ logLevel = "info", autoRefresh = true }: RealTimeLogsViewerProps) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch logs from the database
      let query = supabase
        .from('system_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);
      
      if (logLevel && logLevel !== 'all') {
        query = query.eq('level', logLevel);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      setLogs(data || []);
      
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to fetch system logs');
    } finally {
      setLoading(false);
    }
  }, [logLevel]);

  // Filter logs based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredLogs(logs);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredLogs(
        logs.filter(
          log =>
            log.message.toLowerCase().includes(term) ||
            log.source.toLowerCase().includes(term) ||
            (log.details && log.details.toLowerCase().includes(term))
        )
      );
    }
  }, [logs, searchTerm]);

  // Fetch logs on component mount and whenever log level changes
  useEffect(() => {
    fetchLogs();
    
    // Set up auto-refresh if enabled
    let interval: NodeJS.Timeout | null = null;
    
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 10000); // Refresh every 10 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchLogs, autoRefresh]);

  const handleClearLogs = async () => {
    try {
      const { error } = await supabase
        .rpc('clear_logs');
        
      if (error) {
        throw error;
      }
      
      toast.success('Logs cleared successfully');
      fetchLogs();
    } catch (error) {
      console.error('Error clearing logs:', error);
      toast.error('Failed to clear logs');
    }
  };

  // Render the log level badge
  const renderLevelBadge = (level: string) => {
    const badgeClasses = {
      error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
      info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      debug: "bg-gray-100 text-gray-800 dark:bg-gray-800/60 dark:text-gray-300",
    };
    
    const classes = badgeClasses[level as keyof typeof badgeClasses] || badgeClasses.info;
    
    return (
      <span className={`inline-block px-2 py-1 text-xs rounded-md ${classes}`}>
        {level.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-4 p-1">
      <div className="flex justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={fetchLogs}
                  disabled={loading}
                >
                  <Clock className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh logs</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleClearLogs}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear all logs</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-10">Loading logs...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          {searchTerm ? "No logs matching your search" : "No logs found"}
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Level
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Source
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Message
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/40">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderLevelBadge(log.level)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-1">
                        {log.source === 'database' ? (
                          <Database className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        ) : log.source === 'system' ? (
                          <AlertCircle className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        ) : null}
                        {log.source}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>
                        {log.message}
                        {log.details && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {log.details}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeLogsViewer;
