
import {
  fetchCamerasFromDB,
  saveCameraToDB,
  deleteCameraFromDB,
  fetchWebhooksFromDB,
  saveWebhookToDB,
  deleteWebhookFromDB,
  fetchStorageSettingsFromDB,
  saveStorageSettingsToDB,
  fetchSystemStatsFromDB,
  fetchRecordingSettingsFromDB,
  saveRecordingSettingsToDB,
  fetchAlertSettingsFromDB,
  saveAlertSettingsToDB,
  fetchAdvancedSettingsFromDB,
  saveAdvancedSettingsToDB,
  fetchLogsFromDB,
  addLogToDB,
  saveCameraRecordingStatus,
  checkDatabaseSetup
} from './database';
import { StorageSettings } from '@/types/camera';

// Camera API
export const getCameras = fetchCamerasFromDB;
export const saveCamera = saveCameraToDB;
export const deleteCamera = deleteCameraFromDB;

// Storage API
export const getStorageSettings = fetchStorageSettingsFromDB;
export const saveStorageSettings = saveStorageSettingsToDB;

// Validate storage access
export const validateStorageAccess = async (settings: StorageSettings): Promise<boolean> => {
  try {
    // In a real app, this would connect to the storage service and verify access
    // For now, we'll simulate a validation process with a delay
    console.log("Validating storage access for type:", settings.type);
    
    // Add log entry about validation attempt
    await addLog({
      level: "info",
      source: "storage",
      message: `Validating storage configuration for ${settings.type} storage`,
      details: JSON.stringify(settings)
    });
    
    // Simulate API call with a delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Validate based on storage type
    switch(settings.type) {
      case 's3':
        // Validate S3 configuration
        if (!settings.s3Endpoint || !settings.s3Bucket || !settings.s3AccessKey || !settings.s3SecretKey) {
          await addLog({
            level: "error",
            source: "storage",
            message: "S3 storage configuration validation failed: Missing required fields",
            details: "One or more required S3 configuration fields are missing"
          });
          return false;
        }
        // In a real app, we'd try to connect to the S3 endpoint and test access
        await addLog({
          level: "info",
          source: "storage",
          message: "S3 storage configuration validated successfully",
          details: `Endpoint: ${settings.s3Endpoint}, Bucket: ${settings.s3Bucket}`
        });
        return true;
        
      case 'nas':
        // Validate NAS configuration
        if (!settings.nasAddress || !settings.nasPath) {
          await addLog({
            level: "error",
            source: "storage",
            message: "NAS storage configuration validation failed: Missing required fields",
            details: "NAS address or path missing"
          });
          return false;
        }
        // In a real app, we'd try to connect to the NAS and test access
        await addLog({
          level: "info",
          source: "storage",
          message: "NAS storage configuration validated successfully",
          details: `Address: ${settings.nasAddress}, Path: ${settings.nasPath}`
        });
        return true;
        
      case 'local':
        // Validate local path
        if (!settings.path) {
          await addLog({
            level: "error",
            source: "storage",
            message: "Local storage configuration validation failed: No path specified",
            details: "Local storage path is missing"
          });
          return false;
        }
        // In a real app, we'd check if the path is valid and accessible
        await addLog({
          level: "info",
          source: "storage",
          message: "Local storage configuration validated successfully",
          details: `Path: ${settings.path}`
        });
        return true;
        
      default:
        // For other storage types
        await addLog({
          level: "warning",
          source: "storage",
          message: `Validation for ${settings.type} storage type not implemented`,
          details: "Assuming valid configuration"
        });
        return true;
    }
  } catch (error) {
    // Log the error
    console.error("Error validating storage access:", error);
    await addLog({
      level: "error",
      source: "storage",
      message: `Storage validation error for ${settings.type} storage`,
      details: error instanceof Error ? error.message : String(error)
    });
    return false;
  }
};

// System Stats API
export const getSystemStats = fetchSystemStatsFromDB;

// Recordings API
export const getRecordingSettings = fetchRecordingSettingsFromDB;
export const saveRecordingSettings = saveRecordingSettingsToDB;
export { saveCameraRecordingStatus };

// Alerts API
export const getAlertSettings = fetchAlertSettingsFromDB;
export const saveAlertSettings = saveAlertSettingsToDB;

// Webhooks API
export const getWebhooks = fetchWebhooksFromDB;
export const saveWebhook = saveWebhookToDB;
export const deleteWebhook = deleteWebhookFromDB;

// Advanced Settings API
export const getAdvancedSettings = fetchAdvancedSettingsFromDB;
export const saveAdvancedSettings = saveAdvancedSettingsToDB;

// Logs API
export const getLogs = fetchLogsFromDB;
export const addLog = addLogToDB;

// System initialization
export const initializeSystem = checkDatabaseSetup;

// Firewall API
export const getFirewallSettings = async () => {
  try {
    // We'll implement the actual API call when the backend endpoint is available
    const response = await fetch('/api/firewall/settings');
    if (!response.ok) {
      throw new Error('Failed to fetch firewall settings');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching firewall settings:', error);
    // We'll throw the error to handle it in the component
    throw error;
  }
};

export const updateFirewallStatus = async (enabled: boolean) => {
  try {
    const response = await fetch('/api/firewall/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ enabled }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update firewall status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating firewall status:', error);
    throw error;
  }
};

export const updateFirewallRule = async (rule: any) => {
  try {
    const response = await fetch('/api/firewall/rules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rule),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update firewall rule');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating firewall rule:', error);
    throw error;
  }
};

export const deleteFirewallRule = async (ruleId: string) => {
  try {
    const response = await fetch(`/api/firewall/rules/${ruleId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete firewall rule');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting firewall rule:', error);
    throw error;
  }
};

// Real-time logs API
export const streamLogs = async (logLevel: string, source: string, onLogReceived: (log: any) => void) => {
  try {
    // This would be a WebSocket or Server-Sent Events connection in production
    // For now, we'll use the regular logs endpoint with polling
    const fetchLogsWithPolling = async () => {
      try {
        const filters = {
          level: logLevel !== 'all' ? logLevel : undefined,
          source: source !== 'all' ? source : undefined
        };
        
        const logs = await getLogs(filters);
        onLogReceived(logs);
      } catch (error) {
        console.error('Error streaming logs:', error);
      }
    };
    
    // Initial fetch
    await fetchLogsWithPolling();
    
    // Set up polling (in a real implementation, this would be a WebSocket)
    const intervalId = setInterval(fetchLogsWithPolling, 3000);
    
    // Return cleanup function
    return () => clearInterval(intervalId);
  } catch (error) {
    console.error('Error setting up log stream:', error);
    throw error;
  }
};

// Camera stream setup utility
export const setupCameraStream = (camera, videoElement, onError) => {
  console.log("Setting up stream for camera:", camera.name);
  
  // This is a placeholder implementation - in a real app, this would connect
  // to a streaming service or handle RTSP/RTMP connections
  
  // For now, we'll just set the poster image if available
  if (camera.thumbnail) {
    videoElement.poster = camera.thumbnail;
  }
  
  // Return cleanup function
  return () => {
    console.log("Cleaning up camera stream");
    // Any cleanup code here
  };
};

// Camera groups api
export const getCameraGroups = async () => {
  const cameras = await getCameras();
  
  // Extract unique camera groups
  const groupsMap = new Map();
  cameras.forEach(camera => {
    if (camera.group) {
      if (!groupsMap.has(camera.group)) {
        groupsMap.set(camera.group, {
          id: camera.group,
          name: camera.group,
          cameras: []
        });
      }
      
      groupsMap.get(camera.group).cameras.push(camera);
    }
  });
  
  return Array.from(groupsMap.values());
};
