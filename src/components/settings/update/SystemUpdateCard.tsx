
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, RefreshCw, XCircle, ArrowLeft, Home, Download, Zap } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { SystemUpdateTerminal } from './SystemUpdateTerminal';

interface SystemUpdateCardProps {
  onUpdate: () => Promise<boolean>;
  onRestart: () => Promise<boolean>;
  lastUpdated?: string;
  version?: string;
  onCheckUpdates?: () => Promise<boolean>;
  onSetAutoUpdate?: (enabled: boolean) => Promise<void>;
  autoUpdateEnabled?: boolean;
  checkingForUpdates?: boolean;
}

export const SystemUpdateCard = ({ 
  onUpdate, 
  onRestart, 
  lastUpdated = 'Unknown',
  version = '1.0.0',
  onCheckUpdates,
  onSetAutoUpdate,
  autoUpdateEnabled = false,
  checkingForUpdates = false
}: SystemUpdateCardProps) => {
  const [updating, setUpdating] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [showTerminal, setShowTerminal] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<'update' | 'restart' | null>(null);
  const navigate = useNavigate();

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      setStatus('idle');
      setStatusMessage('Starting update process...');
      setCurrentOperation('update');
      setShowTerminal(true);
      
      const success = await onUpdate();
      
      if (success) {
        setStatus('success');
        setStatusMessage('Update completed successfully. System restart recommended.');
        toast.success('Application updated successfully');
      } else {
        setStatus('error');
        setStatusMessage('Update failed. Please check the logs and try again.');
        toast.error('Update failed');
      }
      
    } catch (error) {
      console.error('Update error:', error);
      setStatus('error');
      setStatusMessage('Update failed with an error. Please try again.');
      toast.error('Update failed with an error');
    } finally {
      setUpdating(false);
    }
  };

  const handleRestart = async () => {
    try {
      setRestarting(true);
      setStatus('idle');
      setStatusMessage('Initiating system restart...');
      setCurrentOperation('restart');
      setShowTerminal(true);
      
      const success = await onRestart();
      
      if (success) {
        setStatus('success');
        setStatusMessage('Restart completed successfully. System is now online.');
        toast.success('System restarted successfully');
        
        // Show reconnecting toast after a brief delay
        setTimeout(() => {
          toast.info('System is back online', {
            duration: 3000,
          });
        }, 2000);
      } else {
        setStatus('error');
        setStatusMessage('Restart failed. Please try again.');
        toast.error('Restart failed');
      }
      
    } catch (error) {
      console.error('Restart error:', error);
      setStatus('error');
      setStatusMessage('Restart failed with an error. Please try again.');
      toast.error('Restart failed with an error');
    } finally {
      setRestarting(false);
    }
  };

  const handleCheckUpdates = async () => {
    if (onCheckUpdates) {
      try {
        const updatesAvailable = await onCheckUpdates();
        if (!updatesAvailable) {
          setStatus('success');
          setStatusMessage('System is up to date. No updates available.');
        }
      } catch (error) {
        setStatus('error');
        setStatusMessage('Failed to check for updates. Please try again.');
      }
    }
  };

  const handleAutoUpdateToggle = async (enabled: boolean) => {
    if (onSetAutoUpdate) {
      try {
        await onSetAutoUpdate(enabled);
      } catch (error) {
        console.error('Failed to toggle auto-update:', error);
      }
    }
  };

  const closeTerminal = () => {
    setShowTerminal(false);
    setCurrentOperation(null);
  };

  const handleGoBack = () => {
    navigate('/settings');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <>
      <div className="space-y-6">
        {/* Navigation buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleGoBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleGoHome}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Home
          </Button>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>System Update</CardTitle>
            <CardDescription>
              Update application code and restart the server
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Current Version</span>
              <span className="font-medium">{version}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Last Updated</span>
              <span className="font-medium">{lastUpdated}</span>
            </div>

            {/* Auto-update setting */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <Label htmlFor="auto-update" className="font-medium">
                  Auto-Update
                </Label>
                <span className="text-sm text-muted-foreground">
                  Automatically update when changes are detected
                </span>
              </div>
              <Switch
                id="auto-update"
                checked={autoUpdateEnabled}
                onCheckedChange={handleAutoUpdateToggle}
                disabled={updating || restarting}
              />
            </div>
            
            {status !== 'idle' && (
              <div className={`p-3 rounded-md flex items-center gap-2 ${
                status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 
                status === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' : ''
              }`}>
                {status === 'success' && <CheckCircle className="h-5 w-5" />}
                {status === 'error' && <XCircle className="h-5 w-5" />}
                <span>{statusMessage}</span>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between w-full">
              <div className="flex gap-2">
                <Button 
                  onClick={handleCheckUpdates} 
                  variant="outline" 
                  size="sm"
                  disabled={updating || restarting || checkingForUpdates}
                  className="flex items-center gap-2"
                >
                  {checkingForUpdates && <RefreshCw className="h-4 w-4 animate-spin" />}
                  <Download className="h-4 w-4" />
                  Check Updates
                </Button>
                
                <Button 
                  onClick={handleUpdate} 
                  variant="outline" 
                  disabled={updating || restarting}
                  className="flex items-center gap-2"
                >
                  {updating && <RefreshCw className="h-4 w-4 animate-spin" />}
                  Update Application
                </Button>
              </div>
              
              <Button 
                onClick={handleRestart}
                variant="default" 
                disabled={updating || restarting}
                className="flex items-center gap-2"
              >
                {restarting && <RefreshCw className="h-4 w-4 animate-spin" />}
                Restart Server
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      <SystemUpdateTerminal 
        isVisible={showTerminal}
        onClose={closeTerminal}
        updateType={currentOperation}
      />
    </>
  );
};
