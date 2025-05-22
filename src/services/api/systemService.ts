
import { toast } from 'sonner';

interface SystemApiResponse {
  success: boolean;
  message: string;
}

export const updateApplication = async (): Promise<SystemApiResponse> => {
  try {
    const response = await fetch('/api/system/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Update failed');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating application:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const restartServer = async (): Promise<SystemApiResponse> => {
  try {
    const response = await fetch('/api/system/restart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Restart failed');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error restarting server:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
