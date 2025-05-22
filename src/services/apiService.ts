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
      
      case 'dropbox':
        // Validate Dropbox configuration
        if (!settings.dropboxToken) {
          await addLog({
            level: "error",
            source: "storage",
            message: "Dropbox configuration validation failed: Missing access token",
            details: "Dropbox access token is required"
          });
          return false;
        }
        await addLog({
          level: "info",
          source: "storage",
          message: "Dropbox storage configuration validated successfully",
          details: `Folder path: ${settings.dropboxFolder || "Root"}`
        });
        return true;
        
      case 'google_drive':
        // Validate Google Drive configuration
        if (!settings.googleDriveToken) {
          await addLog({
            level: "error",
            source: "storage",
            message: "Google Drive configuration validation failed: Missing OAuth token",
            details: "Google Drive OAuth token is required"
          });
          return false;
        }
        await addLog({
          level: "info",
          source: "storage",
          message: "Google Drive storage configuration validated successfully",
          details: `Folder ID: ${settings.googleDriveFolderId || "Root"}`
        });
        return true;
        
      case 'onedrive':
        // Validate OneDrive configuration
        if (!settings.oneDriveToken) {
          await addLog({
            level: "error",
            source: "storage",
            message: "OneDrive configuration validation failed: Missing OAuth token",
            details: "OneDrive OAuth token is required"
          });
          return false;
        }
        await addLog({
          level: "info",
          source: "storage",
          message: "OneDrive storage configuration validated successfully",
          details: `Folder ID: ${settings.oneDriveFolderId || "Root"}`
        });
        return true;
        
      case 'azure_blob':
        // Validate Azure Blob Storage configuration
        if (!settings.azureConnectionString || !settings.azureContainer) {
          await addLog({
            level: "error",
            source: "storage",
            message: "Azure Blob Storage configuration validation failed: Missing required fields",
            details: "Connection string or container name is missing"
          });
          return false;
        }
        await addLog({
          level: "info",
          source: "storage",
          message: "Azure Blob Storage configuration validated successfully",
          details: `Container: ${settings.azureContainer}`
        });
        return true;
        
      case 'backblaze':
        // Validate Backblaze B2 configuration
        if (!settings.backblazeKeyId || !settings.backblazeApplicationKey || !settings.backblazeBucket) {
          await addLog({
            level: "error",
            source: "storage",
            message: "Backblaze B2 configuration validation failed: Missing required fields",
            details: "Key ID, Application Key or Bucket name is missing"
          });
          return false;
        }
        await addLog({
          level: "info",
          source: "storage",
          message: "Backblaze B2 storage configuration validated successfully",
          details: `Bucket: ${settings.backblazeBucket}`
        });
        return true;
        
      default:
        // For unknown storage types
        await addLog({
          level: "warning",
          source: "storage",
          message: `Validation for ${settings.type} storage type not implemented`,
          details: "Assuming valid configuration"
        });
        return false;
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

// Helper function for adding logs with proper type
interface LogEntry {
  level: string;
  source: string;
  message: string;
  details?: string;
}

export const addLog = (logEntry: LogEntry) => {
  return addLogToDB(logEntry.level, logEntry.source, logEntry.message, logEntry.details);
};

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
  console.log("Camera type:", camera.connectionType);
  
  // This is a placeholder implementation - in a real app, this would connect
  // to a streaming service or handle RTSP/RTMP connections

  try {
    // Set up poster image if available
    if (camera.thumbnail) {
      videoElement.poster = camera.thumbnail;
    }
    
    // For ONVIF cameras, we need to handle them specially
    if (camera.connectionType === 'onvif') {
      console.log("Setting up ONVIF camera with details:", {
        ip: camera.ipAddress,
        port: camera.port,
        username: camera.username ? "set" : "not set",
        path: camera.onvifPath
      });
      
      // In a real implementation, this would connect to the camera via ONVIF
      // and set up a stream
      
      // For demo purposes, we'll generate an RTSP URL that would typically
      // be retrieved from the ONVIF camera's GetStreamUri method
      const rtspUrl = `rtsp://${camera.username}:${camera.password}@${camera.ipAddress}:554/Streaming/Channels/101`;
      console.log("Generated RTSP URL for testing:", rtspUrl);
      
      // In a real implementation, we would:
      // 1. Connect to the ONVIF device
      // 2. Get the stream URI
      // 3. Use a backend service to proxy the RTSP stream to HLS or WebRTC
      
      // For this demo, we'll simulate a delay and then report an error,
      // since we don't have the backend services set up to handle RTSP->HLS conversion
      setTimeout(() => {
        onError("ONVIF streaming requires server-side proxy which is not configured. Please use an HLS or RTMP URL instead.");
      }, 2000);
      
      // Instead, for demo we could point to a sample stream:
      // videoElement.src = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
      // This would work but wouldn't represent a real ONVIF connection
    }
    
    // Return cleanup function
    return () => {
      console.log("Cleaning up camera stream for:", camera.name);
      if (videoElement) {
        videoElement.src = '';
        videoElement.load();
      }
    };
  } catch (error) {
    console.error("Error in setupCameraStream:", error);
    onError(error.message || "Unknown error setting up camera stream");
    return () => {}; // Empty cleanup function
  }
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
