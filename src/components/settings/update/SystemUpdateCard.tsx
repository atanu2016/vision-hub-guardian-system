
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, RefreshCw, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SystemUpdateCardProps {
  onUpdate: () => Promise<boolean>;
  onRestart: () => Promise<boolean>;
  lastUpdated?: string;
  version?: string;
}

export const SystemUpdateCard = ({ 
  onUpdate, 
  onRestart, 
  lastUpdated = 'Unknown',
  version = '1.0.0'
}: SystemUpdateCardProps) => {
  const [updating, setUpdating] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      setStatus('idle');
      setStatusMessage('Updating application...');
      
      const success = await onUpdate();
      
      if (success) {
        setStatus('success');
        setStatusMessage('Update completed successfully. System restart recommended.');
        toast.success('Application updated successfully');
      } else {
        setStatus('error');
        setStatusMessage('Update failed. Check logs for details.');
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
      setStatusMessage('Restarting application server...');
      
      const success = await onRestart();
      
      if (success) {
        setStatus('success');
        setStatusMessage('Restart command sent successfully. The application will be unavailable briefly.');
        toast.success('Restart initiated');
        
        // Show reconnecting toast after a brief delay
        setTimeout(() => {
          toast.info('Reconnecting...', {
            duration: 30000,
          });
        }, 2000);
      } else {
        setStatus('error');
        setStatusMessage('Restart failed. Check logs for details.');
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

  return (
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
      
      <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button 
          onClick={handleUpdate} 
          variant="outline" 
          disabled={updating || restarting}
          className="w-full sm:w-auto"
        >
          {updating && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
          Update Application
        </Button>
        
        <Button 
          onClick={handleRestart}
          variant="default" 
          disabled={updating || restarting}
          className="w-full sm:w-auto"
        >
          {restarting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
          Restart Server
        </Button>
      </CardFooter>
    </Card>
  );
};
