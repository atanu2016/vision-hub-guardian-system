
import { Camera, CameraGroup, StorageSettings } from "@/types/camera";

// Empty camera templates - we'll load real data from storage/backend
export const mockCameras: Camera[] = [];

// Empty group templates - we'll load real data from storage/backend
export const mockCameraGroups: CameraGroup[] = [];

// Instead of using mock data directly, let's create utility functions
// to get cameras, either from localStorage or from an API in the future
export const getCameras = (): Camera[] => {
  const storedCameras = localStorage.getItem('cameras');
  if (storedCameras) {
    return JSON.parse(storedCameras);
  }
  return [];
};

export const saveCameras = (cameras: Camera[]): void => {
  localStorage.setItem('cameras', JSON.stringify(cameras));
};

export const getCameraGroups = (): CameraGroup[] => {
  // First get all cameras
  const cameras = getCameras();
  
  // Generate groups dynamically from camera data
  const groupMap: Record<string, Camera[]> = {};
  
  // Group cameras by their group property
  cameras.forEach(camera => {
    const groupName = camera.group || "Ungrouped";
    if (!groupMap[groupName]) {
      groupMap[groupName] = [];
    }
    groupMap[groupName].push(camera);
  });
  
  // Convert the map to an array of CameraGroup objects
  return Object.entries(groupMap).map(([name, groupCameras]) => ({
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    cameras: groupCameras
  }));
};

export const saveStorageSettings = (settings: StorageSettings): void => {
  localStorage.setItem('storageSettings', JSON.stringify(settings));
};

export const getStorageSettings = (): StorageSettings => {
  const storedSettings = localStorage.getItem('storageSettings');
  if (storedSettings) {
    return JSON.parse(storedSettings);
  }
  return {
    type: 'local',
    path: '/recordings'
  };
};

export const getSystemStats = () => {
  const cameras = getCameras();
  const totalCameras = cameras.length;
  const onlineCameras = cameras.filter(cam => cam.status === "online").length;
  const recordingCameras = cameras.filter(cam => cam.recording).length;
  const offlineCameras = totalCameras - onlineCameras;
  
  // Get storage settings
  const storageSettings = getStorageSettings();
  
  // For demonstration, using localStorage to store these stats
  // In a real app, these would come from server monitoring
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
};

// Save initial system stats if none exist
if (!localStorage.getItem('systemStats')) {
  localStorage.setItem('systemStats', JSON.stringify({
    storageUsed: "0 GB",
    storageTotal: "1 TB",
    storagePercentage: 0,
    uptimeHours: 0,
  }));
}

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
