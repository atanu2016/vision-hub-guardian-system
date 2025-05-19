
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

// Camera API
export const getCameras = fetchCamerasFromDB;
export const saveCamera = saveCameraToDB;
export const deleteCamera = deleteCameraFromDB;

// Storage API
export const getStorageSettings = fetchStorageSettingsFromDB;
export const saveStorageSettings = saveStorageSettingsToDB;

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
