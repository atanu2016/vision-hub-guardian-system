
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

  // Function to handle system update
  const updateSystem = async (): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Make API request to the update endpoint
      const response = await fetch('/api/system/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data: SystemUpdateResponse = await response.json();
      
      setLastUpdateStatus({
        success: data.success,
        message: data.message,
        timestamp: Date.now(),
      });
      
      if (data.success) {
        toast.success("System update successful");
      } else {
        toast.error(`Update failed: ${data.message}`);
      }
      
      return data.success;
    } catch (error) {
      console.error('Error updating system:', error);
      
      setLastUpdateStatus({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now(),
      });
      
      toast.error('Error updating system. Check network connection and try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to restart the system
  const restartSystem = async (): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Make API request to the restart endpoint
      const response = await fetch('/api/system/restart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data: SystemUpdateResponse = await response.json();
      
      setLastUpdateStatus({
        success: data.success,
        message: data.message,
        timestamp: Date.now(),
      });
      
      // Set a timeout to check if the server is back online
      if (data.success) {
        toast.success("System restart initiated");
        setTimeout(checkServerStatus, 5000);
      } else {
        toast.error(`Restart failed: ${data.message}`);
      }
      
      return data.success;
    } catch (error) {
      console.error('Error restarting system:', error);
      
      setLastUpdateStatus({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now(),
      });
      
      toast.error('Error restarting system. Check network connection and try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to check if server is back online
  const checkServerStatus = async () => {
    try {
      const response = await fetch('/api/health');
      
      if (response.ok) {
        toast.success('Server is back online');
      } else {
        // Try again in 5 seconds
        setTimeout(checkServerStatus, 5000);
      }
    } catch (error) {
      // Server still restarting, try again
      setTimeout(checkServerStatus, 5000);
    }
  };

  return {
    isLoading,
    lastUpdateStatus,
    updateSystem,
    restartSystem,
  };
};
