
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
