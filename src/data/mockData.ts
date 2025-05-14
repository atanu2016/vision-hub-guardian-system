
import { 
  getCamerasFromAPI, 
  saveCameraToAPI, 
  getCameraGroupsFromAPI, 
  getStorageSettingsFromAPI,
  saveStorageSettingsToAPI,
  getSystemStatsFromAPI
} from "@/services/apiService";
import { Camera, CameraGroup, StorageSettings } from "@/types/camera";

// Empty camera templates - we'll load real data from API/storage
export const mockCameras: Camera[] = [];

// Empty group templates - we'll load real data from API/storage
export const mockCameraGroups: CameraGroup[] = [];

// Get cameras from API, fallback to localStorage
export const getCameras = async (): Promise<Camera[]> => {
  try {
    return await getCamerasFromAPI();
  } catch (error) {
    console.error('Error getting cameras from API, falling back to localStorage:', error);
    const storedCameras = localStorage.getItem('cameras');
    if (storedCameras) {
      return JSON.parse(storedCameras);
    }
    return [];
  }
};

export const saveCameras = async (cameras: Camera[]): Promise<void> => {
  // For bulk save, we'd typically use a different endpoint
  // But for this example, we'll just update localStorage
  localStorage.setItem('cameras', JSON.stringify(cameras));
  
  // In a real implementation, you might do something like:
  // await fetch('/api/cameras/bulk', {
  //   method: 'PUT',
  //   body: JSON.stringify(cameras),
  // });
};

export const saveCamera = async (camera: Camera): Promise<Camera> => {
  return await saveCameraToAPI(camera);
};

export const getCameraGroups = async (): Promise<CameraGroup[]> => {
  try {
    return await getCameraGroupsFromAPI();
  } catch (error) {
    console.error('Error getting camera groups from API, generating from cameras:', error);
    // Generate groups dynamically from camera data (fallback)
    const cameras = await getCameras();
    
    const groupMap: Record<string, Camera[]> = {};
    
    cameras.forEach(camera => {
      const groupName = camera.group || "Ungrouped";
      if (!groupMap[groupName]) {
        groupMap[groupName] = [];
      }
      groupMap[groupName].push(camera);
    });
    
    return Object.entries(groupMap).map(([name, groupCameras]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      cameras: groupCameras
    }));
  }
};

export const saveStorageSettings = async (settings: StorageSettings): Promise<StorageSettings> => {
  return await saveStorageSettingsToAPI(settings);
};

export const getStorageSettings = async (): Promise<StorageSettings> => {
  try {
    return await getStorageSettingsFromAPI();
  } catch (error) {
    console.error('Error getting storage settings from API, falling back to localStorage:', error);
    const storedSettings = localStorage.getItem('storageSettings');
    if (storedSettings) {
      return JSON.parse(storedSettings);
    }
    return {
      type: 'local',
      path: '/recordings'
    };
  }
};

export const getSystemStats = async () => {
  try {
    return await getSystemStatsFromAPI();
  } catch (error) {
    console.error('Error getting system stats from API, falling back to localStorage:', error);
    // Get cameras for stats calculation
    const cameras = await getCameras();
    const totalCameras = cameras.length;
    const onlineCameras = cameras.filter(cam => cam.status === "online").length;
    const recordingCameras = cameras.filter(cam => cam.recording).length;
    const offlineCameras = totalCameras - onlineCameras;
    
    // For demonstration, using localStorage to store these stats
    const storedStats = localStorage.getItem('systemStats');
    let stats = storedStats ? JSON.parse(storedStats) : {
      storageUsed: "0 GB",
      storageTotal: "1 TB",
      storagePercentage: 0,
      uptimeHours: 0,
    };
    
    return {
      totalCameras,
      onlineCameras,
      offlineCameras,
      recordingCameras,
      storageUsed: stats.storageUsed,
      storageTotal: stats.storageTotal,
      storagePercentage: stats.storagePercentage,
      uptimeHours: stats.uptimeHours,
    };
  }
};

// Initialize empty cameras array if none exists
if (!localStorage.getItem('cameras')) {
  localStorage.setItem('cameras', JSON.stringify([]));
}

// Initialize default storage settings if none exist
if (!localStorage.getItem('storageSettings')) {
  localStorage.setItem('storageSettings', JSON.stringify({
    type: 'local',
    path: '/recordings'
  }));
}

// Initialize system stats if none exist
if (!localStorage.getItem('systemStats')) {
  localStorage.setItem('systemStats', JSON.stringify({
    storageUsed: "0 GB",
    storageTotal: "1 TB",
    storagePercentage: 0,
    uptimeHours: 0,
  }));
}
