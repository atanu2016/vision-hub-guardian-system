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
    return JSON.parse(storedCameras);
  }
  // Return public cameras if no stored cameras are found
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
    path: '/recordings'
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
    }
  ];
};

// Camera API functions
export const getCamerasFromAPI = async (): Promise<Camera[]> => {
  try {
    const apiCameras = await fetchWithErrorHandling('/cameras');
    
    // If no cameras were returned or the array is empty, use public cameras
    if (!apiCameras || (Array.isArray(apiCameras) && apiCameras.length === 0)) {
      const publicCameras = getPublicCameras();
      
      // Store them in localStorage as fallback for future use
      localStorage.setItem('cameras', JSON.stringify(publicCameras));
      
      return publicCameras;
    }
    
    return apiCameras;
  } catch (error) {
    console.error("API error, using public cameras:", error);
    const publicCameras = getPublicCameras();
    return publicCameras;
  }
};

export const saveCameraToAPI = async (camera: Camera): Promise<Camera> => {
  const method = camera.id ? 'PUT' : 'POST';
  const url = camera.id ? `/cameras/${camera.id}` : '/cameras';
  
  const result = await fetchWithErrorHandling(url, {
    method,
    body: JSON.stringify(camera),
  });
  
  // Update local storage as fallback
  const cameras = getFallbackCameras();
  if (camera.id) {
    const index = cameras.findIndex(c => c.id === camera.id);
    if (index >= 0) {
      cameras[index] = camera;
    } else {
      cameras.push(camera);
    }
  } else {
    cameras.push({...camera, id: result.id});
  }
  localStorage.setItem('cameras', JSON.stringify(cameras));
  
  return result;
};

export const deleteCameraFromAPI = async (cameraId: string): Promise<void> => {
  await fetchWithErrorHandling(`/cameras/${cameraId}`, {
    method: 'DELETE',
  });
  
  // Update local storage as fallback
  const cameras = getFallbackCameras();
  const filteredCameras = cameras.filter(c => c.id !== cameraId);
  localStorage.setItem('cameras', JSON.stringify(filteredCameras));
};

export const getCameraGroupsFromAPI = async (): Promise<CameraGroup[]> => {
  try {
    return await fetchWithErrorHandling('/camera-groups');
  } catch (error) {
    console.error('Error fetching camera groups, generating from cameras:', error);
    return getFallbackCameraGroups();
  }
};

// Storage settings API functions
export const getStorageSettingsFromAPI = async (): Promise<StorageSettings> => {
  return await fetchWithErrorHandling('/storage/settings');
};

export const saveStorageSettingsToAPI = async (settings: StorageSettings): Promise<StorageSettings> => {
  const result = await fetchWithErrorHandling('/storage/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
  
  // Update local storage as fallback
  localStorage.setItem('storageSettings', JSON.stringify(settings));
  
  return result;
};

// System stats API function
export const getSystemStatsFromAPI = async () => {
  return await fetchWithErrorHandling('/system/stats');
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
    // Try to get cameras from API or localStorage
    const existingCameras = await getCamerasFromAPI();
    
    // If no cameras exist, use public cameras
    if (!existingCameras || existingCameras.length === 0) {
      const publicCameras = getPublicCameras();
      localStorage.setItem('cameras', JSON.stringify(publicCameras));
      console.log('System initialized with public cameras');
    }
  } catch (error) {
    console.error('Error initializing system:', error);
    // Ensure public cameras are available as fallback
    const publicCameras = getPublicCameras();
    localStorage.setItem('cameras', JSON.stringify(publicCameras));
  }
};
