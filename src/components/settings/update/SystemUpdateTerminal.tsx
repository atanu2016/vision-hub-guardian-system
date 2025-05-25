
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Terminal, X } from 'lucide-react';

interface SystemUpdateTerminalProps {
  isVisible: boolean;
  onClose: () => void;
  updateType: 'update' | 'restart' | null;
}

export const SystemUpdateTerminal = ({ 
  isVisible, 
  onClose, 
  updateType 
}: SystemUpdateTerminalProps) => {
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  useEffect(() => {
    if (isVisible && updateType && !isRunning) {
      executeRealCommand();
    }
  }, [isVisible, updateType]);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const executeRealCommand = async () => {
    if (!updateType) return;
    
    setIsRunning(true);
    setOutput([]);
    
    try {
      // Try to establish WebSocket connection for real-time command output
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}/ws/system-terminal`;
      
      try {
        wsRef.current = new WebSocket(wsUrl);
        
        wsRef.current.onopen = () => {
          console.log('WebSocket connected for system terminal');
          // Send the actual command to execute
          wsRef.current?.send(JSON.stringify({
            action: updateType,
            command: updateType === 'update' ? 'bash /opt/visionhub/deploy/update-app.sh' : 'systemctl restart visionhub.service',
            timestamp: Date.now()
          }));
        };
        
        wsRef.current.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.output) {
            setOutput(prev => [...prev, data.output]);
          }
          if (data.error) {
            setOutput(prev => [...prev, `ERROR: ${data.error}`]);
          }
          if (data.completed) {
            setIsRunning(false);
          }
        };
        
        wsRef.current.onerror = () => {
          console.log('WebSocket failed, falling back to HTTP streaming');
          executeWithHttpStreaming();
        };
        
        wsRef.current.onclose = () => {
          setIsRunning(false);
        };
        
      } catch (error) {
        console.log('WebSocket not available, using HTTP streaming');
        executeWithHttpStreaming();
      }
      
    } catch (error) {
      console.error('Failed to start command execution:', error);
      setOutput(prev => [...prev, `ERROR: Failed to start ${updateType} process: ${error.message}`]);
      setIsRunning(false);
    }
  };

  const executeWithHttpStreaming = async () => {
    const endpoint = updateType === 'update' ? '/api/system/update-stream' : '/api/system/restart-stream';
    
    try {
      // Start the real command execution with streaming
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          action: updateType,
          command: updateType === 'update' 
            ? 'bash /opt/visionhub/deploy/update-app.sh'
            : 'systemctl restart visionhub.service',
          stream: true,
          real_execution: true
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Read the response as a stream for real command output
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());
          
          lines.forEach(line => {
            try {
              const data = JSON.parse(line.replace(/^data: /, ''));
              if (data.output) {
                setOutput(prev => [...prev, data.output]);
              }
              if (data.error) {
                setOutput(prev => [...prev, `ERROR: ${data.error}`]);
              }
            } catch {
              // If not JSON, treat as plain command output
              if (line.trim() && !line.startsWith('data:')) {
                setOutput(prev => [...prev, line]);
              }
            }
          });
        }
      }
      
    } catch (error) {
      console.error('HTTP streaming failed:', error);
      // Execute the actual system command as fallback
      executeSystemCommand();
    } finally {
      setIsRunning(false);
    }
  };

  const executeSystemCommand = async () => {
    setOutput(prev => [...prev, `Executing ${updateType} command directly...`]);
    
    try {
      const command = updateType === 'update' 
        ? 'bash /opt/visionhub/deploy/update-app.sh'
        : 'systemctl restart visionhub.service';
        
      setOutput(prev => [...prev, `$ ${command}`]);
      
      const response = await fetch('/api/system/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: command,
          working_directory: updateType === 'update' ? '/opt/visionhub' : '/',
          timeout: 300000 // 5 minutes timeout
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.stdout) {
          result.stdout.split('\n').forEach((line: string) => {
            if (line.trim()) {
              setOutput(prev => [...prev, line]);
            }
          });
        }
        
        if (result.stderr) {
          result.stderr.split('\n').forEach((line: string) => {
            if (line.trim()) {
              setOutput(prev => [...prev, `STDERR: ${line}`]);
            }
          });
        }
        
        if (result.exit_code === 0) {
          setOutput(prev => [...prev, `${updateType} completed successfully!`]);
        } else {
          setOutput(prev => [...prev, `${updateType} failed with exit code: ${result.exit_code}`]);
        }
      } else {
        throw new Error(`Command execution failed: ${response.statusText}`);
      }
      
    } catch (error) {
      console.error('Direct command execution failed:', error);
      setOutput(prev => [...prev, `ERROR: Command execution failed: ${error.message}`]);
      setOutput(prev => [...prev, 'Please check if the backend API endpoints are properly configured.']);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 bg-black text-green-400 border-green-600">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            <CardTitle className="text-green-400">
              {updateType === 'update' ? 'System Update' : 'System Restart'} Terminal
            </CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-green-400 hover:bg-green-900/20"
            disabled={isRunning}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div 
            ref={terminalRef}
            className="bg-black p-4 rounded border border-green-600 h-96 overflow-y-auto font-mono text-sm"
          >
            {output.map((line, index) => (
              <div key={index} className="mb-1">
                {line}
              </div>
            ))}
            {isRunning && (
              <div className="flex items-center">
                <span className="animate-pulse">▋</span>
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-end">
            <Button 
              onClick={onClose} 
              disabled={isRunning}
              className="bg-green-600 hover:bg-green-700 text-black"
            >
              {isRunning ? 'Running...' : 'Close'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
