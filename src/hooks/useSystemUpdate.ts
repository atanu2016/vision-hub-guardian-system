
import { useState } from 'react';
import { toast } from 'sonner';

interface SystemUpdateResponse {
  success: boolean;
  message: string;
}

export const useSystemUpdate = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdateStatus, setLastUpdateStatus] = useState<{
    success: boolean;
    message: string;
    timestamp: number;
  } | null>(null);

  // Function to handle real system update
  const updateSystem = async (): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('Starting real system update process...');
      
      // Call the actual backend update API with proper headers
      const response = await fetch('/api/system/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action: 'update',
          timestamp: Date.now(),
          execute_real_commands: true
        })
      });
      
      if (!response.ok) {
        // If API endpoint doesn't exist, execute the update script directly
        const scriptResponse = await fetch('/api/system/execute-script', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            script: 'update-app.sh',
            action: 'update'
          })
        });
        
        if (!scriptResponse.ok) {
          throw new Error(`Update failed: Script execution not available`);
        }
        
        const scriptResult = await scriptResponse.json();
        
        if (scriptResult.success) {
          setLastUpdateStatus({
            success: true,
            message: scriptResult.message || 'System update completed successfully',
            timestamp: Date.now(),
          });
          
          console.log('System update completed via script execution');
          toast.success('System updated successfully');
          return true;
        } else {
          throw new Error(scriptResult.message || 'Update script failed');
        }
      }
      
      const result = await response.json();
      
      if (result.success) {
        setLastUpdateStatus({
          success: true,
          message: result.message || 'System update completed successfully',
          timestamp: Date.now(),
        });
        
        console.log('System update completed successfully');
        toast.success('System updated successfully');
        return true;
      } else {
        throw new Error(result.message || 'Update failed');
      }
      
    } catch (error) {
      console.error('Error updating system:', error);
      
      setLastUpdateStatus({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now(),
      });
      
      toast.error(`Update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to restart the system
  const restartSystem = async (): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('Starting real system restart process...');
      
      // Call the actual backend restart API
      const response = await fetch('/api/system/restart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action: 'restart',
          timestamp: Date.now(),
          execute_real_commands: true
        })
      });
      
      if (!response.ok) {
        // If API endpoint doesn't exist, execute restart via systemctl
        const scriptResponse = await fetch('/api/system/execute-script', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            script: 'restart-service.sh',
            action: 'restart'
          })
        });
        
        if (!scriptResponse.ok) {
          throw new Error(`Restart failed: Script execution not available`);
        }
        
        const scriptResult = await scriptResponse.json();
        
        if (scriptResult.success) {
          setLastUpdateStatus({
            success: true,
            message: scriptResult.message || 'System restart completed successfully',
            timestamp: Date.now(),
          });
          
          console.log('System restart completed via script execution');
          toast.success('System restarted successfully');
          
          // Show reconnecting message after restart
          setTimeout(() => {
            toast.info('System is back online', {
              duration: 3000,
            });
          }, 3000);
          
          return true;
        } else {
          throw new Error(scriptResult.message || 'Restart script failed');
        }
      }
      
      const result = await response.json();
      
      if (result.success) {
        setLastUpdateStatus({
          success: true,
          message: result.message || 'System restart completed successfully',
          timestamp: Date.now(),
        });
        
        console.log('System restart completed successfully');
        toast.success('System restarted successfully');
        
        // Show reconnecting message after restart
        setTimeout(() => {
          toast.info('System is back online', {
            duration: 3000,
          });
        }, 3000);
        
        return true;
      } else {
        throw new Error(result.message || 'Restart failed');
      }
      
    } catch (error) {
      console.error('Error restarting system:', error);
      
      setLastUpdateStatus({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now(),
      });
      
      toast.error(`Restart failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    lastUpdateStatus,
    updateSystem,
    restartSystem,
  };
};
