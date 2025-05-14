
import { Camera, CameraGroup, StorageSettings } from "@/types/camera";

// Base API URL - in a real implementation, this would be your actual API endpoint
const API_BASE_URL = "/api";

// Generic fetch handler with error management
const fetchWithErrorHandling = async (url: string, options?: RequestInit) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error: ${error}`);
    
    // Fallback to localStorage data when API is not available
    if (url.includes('/cameras')) {
      console.info('Falling back to localStorage for camera data');
      return getFallbackCameras();
    } else if (url.includes('/storage')) {
      console.info('Falling back to localStorage for storage settings');
      return getFallbackStorageSettings();
    } else if (url.includes('/stats')) {
      console.info('Falling back to localStorage for stats');
      return getFallbackSystemStats();
    }
    
    throw error;
  }
};

// Fallback functions that use localStorage
const getFallbackCameras = (): Camera[] => {
  const storedCameras = localStorage.getItem('cameras');
  if (storedCameras) {
    const parsedCameras = JSON.parse(storedCameras);
    if (Array.isArray(parsedCameras) && parsedCameras.length > 0) {
      return parsedCameras;
    }
  }
  // Return public cameras if no stored cameras are found or empty
  return getPublicCameras();
};

const getFallbackCameraGroups = (): CameraGroup[] => {
  const cameras = getFallbackCameras();
  
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

// Enhanced getter for cameras with additional features
export const getCameras = async (): Promise<Camera[]> => {
  try {
    // Try API first
    const apiCameras = await fetchWithErrorHandling('/cameras').catch(() => null);
    
    // Return valid API cameras if available
    if (apiCameras && Array.isArray(apiCameras) && apiCameras.length > 0) {
      return apiCameras;
    }
    
    // Fall back to localStorage
    const cameras = getFallbackCameras();
    
    // Ensure all cameras have required fields
    return cameras.map(camera => ({
      ...camera,
      id: camera.id,
      name: camera.name || 'Unnamed Camera',
      status: camera.status || 'offline',
      lastSeen: camera.lastSeen || new Date().toISOString(),
      recording: !!camera.recording,
      motionDetection: !!camera.motionDetection
    }));
  } catch (error) {
    console.error("API error, using public cameras:", error);
    const publicCameras = getPublicCameras();
    // Make sure we store these in localStorage
    localStorage.setItem('cameras', JSON.stringify(publicCameras));
    return publicCameras;
  }
};

export const saveCameraToAPI = async (camera: Camera): Promise<Camera> => {
  const method = camera.id ? 'PUT' : 'POST';
  const url = camera.id ? `/cameras/${camera.id}` : '/cameras';
  
  try {
    // Try the API call first
    const result = await fetchWithErrorHandling(url, {
      method,
      body: JSON.stringify(camera),
    }).catch(() => null);
    
    if (result) {
      return result;
    }
    
    // If API call fails, update localStorage
    const cameras = getFallbackCameras();
    let updatedCameras;
    
    if (camera.id) {
      const index = cameras.findIndex(c => c.id === camera.id);
      if (index >= 0) {
        cameras[index] = camera;
        updatedCameras = [...cameras];
      } else {
        updatedCameras = [...cameras, camera];
      }
    } else {
      // Generate a new ID for new cameras
      const newCamera = {
        ...camera, 
        id: `cam-${Date.now()}`,
        lastSeen: new Date().toISOString()
      };
      updatedCameras = [...cameras, newCamera];
      camera = newCamera; // Return the new camera with ID
    }
    
    localStorage.setItem('cameras', JSON.stringify(updatedCameras));
    
    // Update system stats
    updateSystemStats(updatedCameras);
    
    return camera;
  } catch (error) {
    console.error('Error saving camera:', error);
    throw error;
  }
};

export const deleteCameraFromAPI = async (cameraId: string): Promise<void> => {
  try {
    // Try the API call first
    await fetchWithErrorHandling(`/cameras/${cameraId}`, {
      method: 'DELETE',
    }).catch(() => null);
    
    // Update localStorage regardless of API success
    const cameras = getFallbackCameras();
    const filteredCameras = cameras.filter(c => c.id !== cameraId);
    localStorage.setItem('cameras', JSON.stringify(filteredCameras));
    
    // Update system stats
    updateSystemStats(filteredCameras);
  } catch (error) {
    console.error('Error deleting camera:', error);
    throw error;
  }
};

export const getCameraGroupsFromAPI = async (): Promise<CameraGroup[]> => {
  try {
    // Try API first
    const apiGroups = await fetchWithErrorHandling('/camera-groups').catch(() => null);
    
    if (apiGroups && Array.isArray(apiGroups) && apiGroups.length > 0) {
      return apiGroups;
    }
    
    // Fall back to generating groups from cameras
    return getFallbackCameraGroups();
  } catch (error) {
    console.error('Error fetching camera groups, generating from cameras:', error);
    return getFallbackCameraGroups();
  }
};

// Storage settings API functions
export const getStorageSettings = async (): Promise<StorageSettings> => {
  try {
    // Try API first
    const apiSettings = await fetchWithErrorHandling('/storage/settings').catch(() => null);
    
    if (apiSettings) {
      return apiSettings;
    }
    
    // Fall back to localStorage
    return getFallbackStorageSettings();
  } catch (error) {
    console.error('Error fetching storage settings:', error);
    return getFallbackStorageSettings();
  }
};

export const saveStorageSettings = async (settings: StorageSettings): Promise<StorageSettings> => {
  try {
    // Try the API call first
    const result = await fetchWithErrorHandling('/storage/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }).catch(() => null);
    
    // Update local storage regardless of API success
    localStorage.setItem('storageSettings', JSON.stringify(settings));
    
    return result || settings;
  } catch (error) {
    console.error('Error saving storage settings:', error);
    throw error;
  }
};

// System stats API function
export const getSystemStats = async () => {
  try {
    // Try API first
    const apiStats = await fetchWithErrorHandling('/system/stats').catch(() => null);
    
    if (apiStats) {
      return apiStats;
    }
    
    // Fall back to localStorage
    return getFallbackSystemStats();
  } catch (error) {
    console.error('Error fetching system stats:', error);
    return getFallbackSystemStats();
  }
};

// Update system stats in localStorage based on current cameras
const updateSystemStats = (cameras: Camera[]) => {
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

// Initialize the system by ensuring public cameras are available
export const initializeSystem = async (): Promise<void> => {
  try {
    // Clear existing cameras to ensure we always have fresh public cameras
    localStorage.removeItem('cameras');
    
    // Get the public cameras
    const publicCameras = getPublicCameras();
    
    // Store them in localStorage
    localStorage.setItem('cameras', JSON.stringify(publicCameras));
    
    // Update system stats
    const stats = {
      storageUsed: "0 GB",
      storageTotal: "1 TB",
      storagePercentage: 0,
      uptimeHours: 0,
      totalCameras: publicCameras.length,
      onlineCameras: publicCameras.filter(c => c.status === 'online').length,
      offlineCameras: publicCameras.filter(c => c.status === 'offline').length,
      recordingCameras: publicCameras.filter(c => c.recording).length,
    };
    
    localStorage.setItem('systemStats', JSON.stringify(stats));
    
    console.log('System initialized with public cameras');
    
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
    
    // Initialize debug logs storage
    if (!localStorage.getItem('debug-logs')) {
      localStorage.setItem('debug-logs', JSON.stringify([
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'System initialized with public cameras'
        }
      ]));
    }
    
  } catch (error) {
    console.error('Error initializing system:', error);
    // Ensure public cameras are available as fallback
    const publicCameras = getPublicCameras();
    localStorage.setItem('cameras', JSON.stringify(publicCameras));
  }
};
