
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

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  useEffect(() => {
    if (isVisible && updateType && !isRunning) {
      executeCommand();
    }
  }, [isVisible, updateType]);

  const executeCommand = async () => {
    if (!updateType) return;
    
    setIsRunning(true);
    setOutput([]);
    
    const commands = updateType === 'update' 
      ? [
          'Starting system update...',
          'Checking Git repository status...',
          'git fetch origin',
          'Fetching latest changes from remote repository...',
          'git pull origin main',
          'Updating codebase...',
          'npm install',
          'Installing/updating dependencies...',
          'npm run build',
          'Building application...',
          'Update completed successfully!',
          'System ready for restart.'
        ]
      : [
          'Initiating system restart...',
          'Stopping application services...',
          'systemctl stop visionhub.service',
          'Service stopped.',
          'systemctl start visionhub.service',
          'Starting application services...',
          'Application restarted successfully!',
          'System is now online.'
        ];

    for (let i = 0; i < commands.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
      
      setOutput(prev => [...prev, `$ ${commands[i]}`]);
      
      // Simulate command output
      if (commands[i].includes('git') || commands[i].includes('npm') || commands[i].includes('systemctl')) {
        await new Promise(resolve => setTimeout(resolve, 400));
        setOutput(prev => [...prev, `✓ Command executed successfully`]);
      }
    }
    
    setIsRunning(false);
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
