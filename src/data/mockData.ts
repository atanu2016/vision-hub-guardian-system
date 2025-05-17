
// Import database service functions
import {
  fetchCamerasFromDB,
  fetchSystemStatsFromDB,
  saveCameraToDB,
  deleteCameraFromDB,
  fetchStorageSettingsFromDB,
  saveStorageSettingsToDB,
  checkDatabaseSetup
} from "@/services/database";

// Export database functions with more intuitive naming
export const getCameras = fetchCamerasFromDB;
export const getSystemStats = fetchSystemStatsFromDB;
export const saveCamera = saveCameraToDB;
export const deleteCamera = deleteCameraFromDB;
export const getStorageSettings = fetchStorageSettingsFromDB;
export const saveStorageSettings = saveStorageSettingsToDB;
export const initializeSystem = checkDatabaseSetup;

// Camera groups function with memoization to prevent constant recalculation
let groupsCache: any[] | null = null;
let groupsCacheExpiry = 0;

export const getCameraGroups = async () => {
  const now = Date.now();
  // Use cached result if available and not expired (5 minute TTL)
  if (groupsCache && groupsCacheExpiry > now) {
    return groupsCache;
  }
  
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
  
  // Update cache
  groupsCache = Array.from(groupsMap.values());
  groupsCacheExpiry = now + (5 * 60 * 1000); // 5 minutes
  
  return groupsCache;
};
