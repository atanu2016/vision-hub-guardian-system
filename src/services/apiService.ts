
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
  return storedCameras ? JSON.parse(storedCameras) : [];
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

// Camera API functions
export const getCamerasFromAPI = async (): Promise<Camera[]> => {
  return await fetchWithErrorHandling('/cameras');
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
  // This would generate or return a proper stream URL based on camera properties
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
    
    // For demonstration - in a real implementation, you would use HLS.js, WebRTC, or similar
    // This is just a placeholder showing how you would wire things up
    
    // Use a placeholder until real streams can be integrated
    console.log(`Setting up camera stream for ${camera.name} using URL: ${streamUrl}`);
    videoElement.poster = camera.thumbnail || '/placeholder.svg';
    
    // In a real implementation:
    // if (Hls.isSupported()) {
    //   const hls = new Hls();
    //   hls.loadSource(streamUrl);
    //   hls.attachMedia(videoElement);
    //   hls.on(Hls.Events.MANIFEST_PARSED, () => {
    //     videoElement.play();
    //   });
    //   return () => {
    //     hls.destroy();
    //   };
    // }
    
    return () => {
      // Cleanup function
      videoElement.src = '';
    };
  } catch (error) {
    console.error('Error setting up camera stream:', error);
    if (onError) {
      onError(error as Error);
    }
    return () => {};
  }
};
