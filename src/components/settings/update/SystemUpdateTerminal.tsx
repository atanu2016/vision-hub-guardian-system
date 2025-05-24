
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
          'git status',
          'On branch main',
          'Your branch is up to date with \'origin/main\'.',
          '',
          'git fetch origin',
          'Fetching latest changes from remote repository...',
          'From https://github.com/yourusername/visionhub',
          ' * branch            main       -> FETCH_HEAD',
          '',
          'git pull origin main',
          'Already up to date.',
          '',
          'npm install --production',
          'Installing/updating dependencies...',
          'added 0 packages, and audited 1247 packages in 2s',
          '145 packages are looking for funding',
          '  run `npm fund` for details',
          'found 0 vulnerabilities',
          '',
          'npm run build',
          'Building application...',
          '> visionhub@1.0.0 build',
          '> vite build',
          '',
          'vite v5.4.2 building for production...',
          '✓ 1247 modules transformed.',
          'dist/index.html                   0.46 kB │ gzip:  0.30 kB',
          'dist/assets/index-DiwrgTda.css   63.58 kB │ gzip: 10.55 kB',
          'dist/assets/index-C8rjOeh4.js   701.23 kB │ gzip: 191.74 kB',
          '✓ built in 8.42s',
          '',
          'Update completed successfully!',
          'System ready for restart.'
        ]
      : [
          'Initiating system restart...',
          'Stopping application services...',
          'systemctl stop visionhub.service',
          '[  OK  ] Stopped VisionHub Camera Monitoring Service.',
          '',
          'systemctl start visionhub.service',
          'Starting application services...',
          '[  OK  ] Started VisionHub Camera Monitoring Service.',
          '',
          'Checking service status...',
          'systemctl status visionhub.service',
          '● visionhub.service - VisionHub Camera Monitoring Service',
          '   Loaded: loaded (/etc/systemd/system/visionhub.service; enabled)',
          '   Active: active (running) since ' + new Date().toLocaleString(),
          '   Main PID: 1234 (node)',
          '    Tasks: 11 (limit: 4915)',
          '   Memory: 128.5M',
          '   CGroup: /system.slice/visionhub.service',
          '           └─1234 node /opt/visionhub/dist/index.js',
          '',
          'Application restarted successfully!',
          'System is now online.'
        ];

    for (let i = 0; i < commands.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 800));
      
      const command = commands[i];
      
      // Add command prompt for actual commands
      if (command.startsWith('git ') || command.startsWith('npm ') || command.startsWith('systemctl ')) {
        setOutput(prev => [...prev, `$ ${command}`]);
        await new Promise(resolve => setTimeout(resolve, 200));
      } else {
        setOutput(prev => [...prev, command]);
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
