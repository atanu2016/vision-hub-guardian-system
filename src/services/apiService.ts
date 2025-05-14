import { Camera, CameraGroup, StorageSettings } from "@/types/camera";
import { 
  fetchCamerasFromDB, 
  saveCameraToDB, 
  deleteCameraFromDB,
  fetchStorageSettingsFromDB,
  saveStorageSettingsToDB,
  fetchSystemStatsFromDB,
  updateSystemStats,
  syncPublicCamerasToDatabase,
  checkDatabaseSetup
} from "./databaseService";

// Base API URL - in a real implementation, this would be your actual API endpoint
const API_BASE_URL = "/api";

// Public cameras for testing
export const getPublicCameras = (): Camera[] => {
  return [
    {
      id: "pub-cam-1",
      name: "Times Square",
      location: "New York City, USA",
      ipAddress: "public-stream-1",
      port: 80,
      username: "public",
      status: "online",
      model: "Public Stream",
      manufacturer: "EarthCam",
      lastSeen: new Date().toISOString(),
      recording: false,
      thumbnail: "https://images.unsplash.com/photo-1534270804882-6b5048b1c1fc?q=80&w=300",
      group: "Public Feeds",
      connectionType: "rtmp",
      rtmpUrl: "https://videos3.earthcam.com/fecnetwork/hdtimes10.flv/playlist.m3u8",
      motionDetection: false,
    },
    {
      id: "pub-cam-2",
      name: "Abbey Road",
      location: "London, UK",
      ipAddress: "public-stream-2",
      port: 80,
      username: "public",
      status: "online",
      model: "Public Stream",
      manufacturer: "AbbeyRoad",
      lastSeen: new Date().toISOString(),
      recording: false,
      thumbnail: "https://images.unsplash.com/photo-1520986606214-8b456906c813?q=80&w=300",
      group: "Public Feeds",
      connectionType: "rtmp",
      rtmpUrl: "https://videos3.earthcam.com/fecnetwork/AbbeyRoadHD1.flv/playlist.m3u8",
      motionDetection: false,
    },
    {
      id: "pub-cam-3",
      name: "Tokyo Shibuya Crossing",
      location: "Tokyo, Japan",
      ipAddress: "public-stream-3",
      port: 80,
      username: "public",
      status: "online",
      model: "Public Stream",
      manufacturer: "JapanCams",
      lastSeen: new Date().toISOString(),
      recording: false,
      thumbnail: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=300",
      group: "Public Feeds",
      connectionType: "rtmp",
      rtmpUrl: "https://b.live-img.com/api/v2/live/player?id=1693392400000",
      motionDetection: false,
    },
    {
      id: "pub-cam-4",
      name: "International Space Station",
      location: "Earth Orbit",
      ipAddress: "public-stream-4",
      port: 80,
      username: "public",
      status: "online",
      model: "ISS Live Stream",
      manufacturer: "NASA",
      lastSeen: new Date().toISOString(),
      recording: false,
      thumbnail: "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?q=80&w=300",
      group: "Public Feeds",
      connectionType: "rtmp",
      rtmpUrl: "https://nasa-i.akamaihd.net/hls/live/253565/NASA-NTV1-Public/master.m3u8",
      motionDetection: false,
    },
    {
      id: "pub-cam-5",
      name: "Venice Grand Canal",
      location: "Venice, Italy",
      ipAddress: "public-stream-5",
      port: 80,
      username: "public",
      status: "online",
      model: "Public Stream",
      manufacturer: "ItalyCams",
      lastSeen: new Date().toISOString(),
      recording: false,
      thumbnail: "https://images.unsplash.com/photo-1498307833015-e7b400441eb8?q=80&w=300",
      group: "Public Feeds",
      connectionType: "rtmp",
      rtmpUrl: "https://webcamurl.it/webcam/venice1.m3u8",
      motionDetection: false,
    }
  ];
};

// Enhanced getter for cameras with database integration
export const getCameras = async (): Promise<Camera[]> => {
  try {
    // Check if database is set up
    const isDatabaseSetup = await checkDatabaseSetup();
    
    if (isDatabaseSetup) {
      // Try to get cameras from database
      try {
        const cameras = await fetchCamerasFromDB();
        if (cameras.length > 0) {
          return cameras;
        }
        
        // If no cameras in database, sync public cameras
        const publicCameras = getPublicCameras();
        await syncPublicCamerasToDatabase(publicCameras);
        return await fetchCamerasFromDB();
      } catch (dbError) {
        console.error("Database error, using public cameras:", dbError);
        return getPublicCameras();
      }
    } else {
      // Use public cameras as fallback
      console.log("Database not set up, using public cameras");
      return getPublicCameras();
    }
  } catch (error) {
    console.error("Error getting cameras:", error);
    return getPublicCameras();
  }
};

// Export function to save camera data
export const saveCameraToAPI = async (camera: Camera): Promise<Camera> => {
  try {
    // Try to save to database first
    const isDatabaseSetup = await checkDatabaseSetup();
    
    if (isDatabaseSetup) {
      const savedCamera = await saveCameraToDB(camera);
      
      // Update system stats after camera change
      const allCameras = await fetchCamerasFromDB();
      await updateSystemStats(allCameras);
      
      return savedCamera;
    } else {
      // Fallback to local storage
      console.log("Database not set up, using localStorage fallback");
      return fallbackSaveCamera(camera);
    }
  } catch (error) {
    console.error('Error saving camera:', error);
    return fallbackSaveCamera(camera);
  }
};

export const deleteCameraFromAPI = async (cameraId: string): Promise<void> => {
  try {
    // Try to delete from database first
    const isDatabaseSetup = await checkDatabaseSetup();
    
    if (isDatabaseSetup) {
      await deleteCameraFromDB(cameraId);
      
      // Update system stats after camera deletion
      const allCameras = await fetchCamerasFromDB();
      await updateSystemStats(allCameras);
    } else {
      // Fallback to local storage
      console.log("Database not set up, using localStorage fallback");
      fallbackDeleteCamera(cameraId);
    }
  } catch (error) {
    console.error('Error deleting camera:', error);
    fallbackDeleteCamera(cameraId);
  }
};

export const getCameraGroupsFromAPI = async (): Promise<CameraGroup[]> => {
  try {
    // Get cameras and group them
    const cameras = await getCameras();
    return groupCamerasByType(cameras);
  } catch (error) {
    console.error('Error getting camera groups:', error);
    return [];
  }
};

// Helper to group cameras by type
const groupCamerasByType = (cameras: Camera[]): CameraGroup[] => {
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
};

// Adding the needed export for getCameraGroups
export const getCameraGroups = async (): Promise<CameraGroup[]> => {
  return await getCameraGroupsFromAPI();
};

// Storage settings API functions with database integration
export const getStorageSettings = async (): Promise<StorageSettings> => {
  try {
    // Check if database is set up
    const isDatabaseSetup = await checkDatabaseSetup();
    
    if (isDatabaseSetup) {
      return await fetchStorageSettingsFromDB();
    } else {
      // Fallback to local storage
      return getFallbackStorageSettings();
    }
  } catch (error) {
    console.error('Error fetching storage settings:', error);
    return getFallbackStorageSettings();
  }
};

export const saveStorageSettings = async (settings: StorageSettings): Promise<StorageSettings> => {
  try {
    // Check if database is set up
    const isDatabaseSetup = await checkDatabaseSetup();
    
    if (isDatabaseSetup) {
      return await saveStorageSettingsToDB(settings);
    } else {
      // Fallback to local storage
      localStorage.setItem('storageSettings', JSON.stringify(settings));
      return settings;
    }
  } catch (error) {
    console.error('Error saving storage settings:', error);
    localStorage.setItem('storageSettings', JSON.stringify(settings));
    return settings;
  }
};

// System stats API function with database integration
export const getSystemStats = async () => {
  try {
    // Check if database is set up
    const isDatabaseSetup = await checkDatabaseSetup();
    
    if (isDatabaseSetup) {
      return await fetchSystemStatsFromDB();
    } else {
      // Fallback to local storage
      return getFallbackSystemStats();
    }
  } catch (error) {
    console.error('Error fetching system stats:', error);
    return getFallbackSystemStats();
  }
};

// Fallback functions that use localStorage
const getFallbackStorageSettings = (): StorageSettings => {
  const storedSettings = localStorage.getItem('storageSettings');
  return storedSettings ? JSON.parse(storedSettings) : {
    type: 'local',
    path: '/recordings',
    retentionDays: 30,
    overwriteOldest: true
  };
};

const getFallbackSystemStats = () => {
  const storedStats = localStorage.getItem('systemStats');
  return storedStats ? JSON.parse(storedStats) : {
    storageUsed: "0 GB",
    storageTotal: "1 TB",
    storagePercentage: 0,
    uptimeHours: 0,
    totalCameras: 0,
    onlineCameras: 0,
    offlineCameras: 0,
    recordingCameras: 0,
  };
};

const fallbackSaveCamera = (camera: Camera): Camera => {
  // Get existing cameras from localStorage
  const existingCamerasString = localStorage.getItem('cameras');
  const cameras = existingCamerasString ? JSON.parse(existingCamerasString) : [];
  
  // Check if camera has an ID
  if (camera.id) {
    // Update existing camera
    const index = cameras.findIndex((c: Camera) => c.id === camera.id);
    if (index >= 0) {
      cameras[index] = { ...camera };
    } else {
      cameras.push(camera);
    }
  } else {
    // Add new camera with generated ID
    const newCamera = {
      ...camera, 
      id: `cam-${Date.now()}`,
      lastSeen: new Date().toISOString()
    };
    cameras.push(newCamera);
    camera = newCamera;
  }
  
  // Save cameras back to localStorage
  localStorage.setItem('cameras', JSON.stringify(cameras));
  
  // Update system stats
  updateFallbackSystemStats(cameras);
  
  return camera;
};

const fallbackDeleteCamera = (cameraId: string): void => {
  // Get existing cameras from localStorage
  const existingCamerasString = localStorage.getItem('cameras');
  if (!existingCamerasString) return;
  
  const cameras = JSON.parse(existingCamerasString);
  
  // Filter out the camera to delete
  const filteredCameras = cameras.filter((c: Camera) => c.id !== cameraId);
  
  // Save cameras back to localStorage
  localStorage.setItem('cameras', JSON.stringify(filteredCameras));
  
  // Update system stats
  updateFallbackSystemStats(filteredCameras);
};

// Update system stats in localStorage
const updateFallbackSystemStats = (cameras: Camera[]) => {
  const totalCameras = cameras.length;
  const onlineCameras = cameras.filter(c => c.status === 'online').length;
  const offlineCameras = cameras.filter(c => c.status === 'offline').length;
  const recordingCameras = cameras.filter(c => c.recording).length;
  
  const stats = {
    ...getFallbackSystemStats(),
    totalCameras,
    onlineCameras,
    offlineCameras,
    recordingCameras,
  };
  
  localStorage.setItem('systemStats', JSON.stringify(stats));
};

// Camera stream related functions
export const getCameraStreamUrl = (camera: Camera): string => {
  // If the camera has a defined RTMP URL, use it directly
  if (camera.connectionType === 'rtmp' && camera.rtmpUrl) {
    return camera.rtmpUrl;
  } else if (camera.connectionType === 'ip') {
    return `${API_BASE_URL}/stream/${camera.id}`;
  } else {
    return `${API_BASE_URL}/stream/${camera.id}`;
  }
};

// Live view setup function
export const setupCameraStream = (
  camera: Camera, 
  videoElement: HTMLVideoElement | null, 
  onError?: (error: Error) => void
): (() => void) => {
  if (!videoElement) {
    return () => {}; // No cleanup needed
  }

  try {
    const streamUrl = getCameraStreamUrl(camera);
    
    console.log(`Setting up camera stream for ${camera.name} using URL: ${streamUrl}`);
    
    // Set the video source directly for public RTMP streams
    if (camera.connectionType === 'rtmp' && camera.rtmpUrl) {
      videoElement.src = streamUrl;
      videoElement.poster = camera.thumbnail || '/placeholder.svg';
      
      // Try to play the video, handle potential autoplay restrictions
      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('Autoplay was prevented. User interaction required.', error);
          // Show a play button or message here if needed
        });
      }
    } else {
      // For other types, just show the poster image
      videoElement.poster = camera.thumbnail || '/placeholder.svg';
    }
    
    return () => {
      // Cleanup function
      videoElement.pause();
      videoElement.src = '';
      videoElement.load(); // Ensures resources are released
    };
  } catch (error) {
    console.error('Error setting up camera stream:', error);
    if (onError) {
      onError(error as Error);
    }
    return () => {};
  }
};

// Initialize the system with database integration
export const initializeSystem = async (): Promise<void> => {
  try {
    // Check if database is set up
    const isDatabaseSetup = await checkDatabaseSetup();
    
    if (isDatabaseSetup) {
      // Get cameras from database
      const cameras = await fetchCamerasFromDB();
      
      // If no cameras in database, sync public cameras
      if (cameras.length === 0) {
        const publicCameras = getPublicCameras();
        await syncPublicCamerasToDatabase(publicCameras);
      }
      
      // Update system stats
      const updatedCameras = await fetchCamerasFromDB();
      await updateSystemStats(updatedCameras);
      
      console.log('System initialized with database integration');
    } else {
      console.log('Database not set up, using localStorage fallback');
      
      // Initialize with public cameras in localStorage
      const publicCameras = getPublicCameras();
      localStorage.setItem('cameras', JSON.stringify(publicCameras));
      
      // Update system stats
      updateFallbackSystemStats(publicCameras);
      
      // Initialize storage settings with defaults if not already set
      const storageSettings = localStorage.getItem('storageSettings');
      if (!storageSettings) {
        localStorage.setItem('storageSettings', JSON.stringify({
          type: 'local',
          path: '/var/lib/vision-hub/recordings',
          retentionDays: 30,
          overwriteOldest: true
        }));
      }
    }
  } catch (error) {
    console.error('Error initializing system:', error);
    
    // Ensure public cameras are available as fallback
    const publicCameras = getPublicCameras();
    localStorage.setItem('cameras', JSON.stringify(publicCameras));
  }
};
