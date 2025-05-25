
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface SystemUpdateResponse {
  success: boolean;
  message: string;
  version?: string;
  changes?: string[];
}

export const useSystemUpdate = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [checkingForUpdates, setCheckingForUpdates] = useState(false);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(false);
  const [lastUpdateStatus, setLastUpdateStatus] = useState<{
    success: boolean;
    message: string;
    timestamp: number;
    version?: string;
  } | null>(null);

  // Check for updates on mount and every 5 minutes
  useEffect(() => {
    checkForUpdates();
    
    // Set up auto-update checking
    const interval = setInterval(() => {
      if (autoUpdateEnabled) {
        checkForUpdates(true); // Silent check
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [autoUpdateEnabled]);

  // Function to check for updates
  const checkForUpdates = async (silent = false): Promise<boolean> => {
    if (!silent) setCheckingForUpdates(true);
    
    try {
      console.log('Checking for updates from GitHub...');
      
      const response = await fetch('/api/system/check-updates', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Update check failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.updatesAvailable) {
        if (!silent) {
          toast.info(`Updates available! ${result.changesCount} new changes found.`);
        }
        
        // Auto-update if enabled
        if (autoUpdateEnabled && silent) {
          console.log('Auto-updating system...');
          await updateSystem(true);
        }
        
        return true;
      } else {
        if (!silent) {
          toast.success('System is up to date');
        }
        return false;
      }
      
    } catch (error) {
      console.error('Error checking for updates:', error);
      if (!silent) {
        toast.error(`Update check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      return false;
    } finally {
      if (!silent) setCheckingForUpdates(false);
    }
  };

  // Function to handle real system update
  const updateSystem = async (autoUpdate = false): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('Starting real system update process...');
      
      // Call the actual backend update API
      const response = await fetch('/api/system/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action: 'update',
          timestamp: Date.now(),
          auto_update: autoUpdate,
          execute_real_commands: true
        })
      });
      
      if (!response.ok) {
        throw new Error(`Update failed: ${response.statusText}`);
      }
      
      const result: SystemUpdateResponse = await response.json();
      
      if (result.success) {
        setLastUpdateStatus({
          success: true,
          message: result.message || 'System update completed successfully',
          timestamp: Date.now(),
          version: result.version
        });
        
        console.log('System update completed successfully');
        
        if (!autoUpdate) {
          toast.success('System updated successfully');
        } else {
          toast.info('System auto-updated in the background');
        }
        
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
      
      if (!autoUpdate) {
        toast.error(`Update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
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
        throw new Error(`Restart failed: ${response.statusText}`);
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

  // Function to enable/disable auto-update
  const setAutoUpdate = async (enabled: boolean): Promise<void> => {
    try {
      const response = await fetch('/api/system/auto-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled,
          timestamp: Date.now()
        })
      });
      
      if (response.ok) {
        setAutoUpdateEnabled(enabled);
        toast.success(`Auto-update ${enabled ? 'enabled' : 'disabled'}`);
      } else {
        throw new Error('Failed to update auto-update setting');
      }
    } catch (error) {
      console.error('Error setting auto-update:', error);
      toast.error('Failed to update auto-update setting');
    }
  };

  return {
    isLoading,
    checkingForUpdates,
    autoUpdateEnabled,
    lastUpdateStatus,
    updateSystem,
    restartSystem,
    checkForUpdates,
    setAutoUpdate,
  };
};
