
// Import database service functions directly
import {
  fetchCamerasFromDB as getCameras,
  fetchSystemStatsFromDB as getSystemStats,
  saveCameraToDB as saveCamera,
  deleteCameraFromDB as deleteCamera,
  fetchStorageSettingsFromDB as getStorageSettings,
  saveStorageSettingsToDB as saveStorageSettings,
  checkDatabaseSetup as initializeSystem
} from "@/services/databaseService";

// Export all database functions directly
export {
  getCameras,
  getSystemStats,
  saveCamera,
  deleteCamera,
  getStorageSettings,
  saveStorageSettings,
  initializeSystem
};

// Export function for camera groups
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
