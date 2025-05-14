
// Import the database service functions directly
import {
  fetchCamerasFromDB,
  fetchSystemStatsFromDB,
  saveCameraToDB,
  deleteCameraFromDB,
  fetchStorageSettingsFromDB,
  saveStorageSettingsToDB,
  syncPublicCamerasToDatabase,
  checkDatabaseSetup
} from '@/services/databaseService';
import { Camera } from '@/types/camera';

// Re-export all database functions with more intuitive names
export const getCameras = fetchCamerasFromDB;
export const getSystemStats = fetchSystemStatsFromDB;
export const saveCamera = saveCameraToDB;
export const deleteCamera = deleteCameraFromDB;
export const getStorageSettings = fetchStorageSettingsFromDB;
export const saveStorageSettings = saveStorageSettingsToDB;

// Add the missing setupCameraStream function
export const setupCameraStream = (
  camera: Camera, 
  videoElement: HTMLVideoElement, 
  onError?: (err: any) => void
): (() => void) => {
  try {
    // Basic function to connect a video element to a camera stream
    // Returns a cleanup function
    console.log(`Setting up camera stream for ${camera.name}`);
    
    // The actual implementation would depend on the streaming protocol
    // For now, we'll just handle direct URL assignment
    if (camera.rtmpUrl) {
      videoElement.src = camera.rtmpUrl;
      videoElement.onerror = (err) => {
        console.error('Video element error:', err);
        if (onError) onError(err);
      };
    }
    
    return () => {
      // Cleanup function
      videoElement.src = '';
      videoElement.onerror = null;
    };
  } catch (err) {
    console.error('Error setting up stream:', err);
    if (onError) onError(err);
    return () => {}; // Return empty cleanup function
  }
};

// Initialize the system
export const initializeSystem = async () => {
  try {
    // Check if database has been set up
    const isDbSetup = await checkDatabaseSetup();
    
    // If not, sync public cameras to database
    if (!isDbSetup) {
      // Generate some example cameras
      const publicCameras = [
        {
          name: 'Front Door',
          status: 'online',
          location: 'Entrance',
          ipAddress: '192.168.1.100',
          port: 8080,
          connectionType: 'rtsp',
          rtmpUrl: 'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov',
          recording: true,
          motionDetection: true,
          group: 'Outdoor',
          model: 'VisionCam Pro',
          manufacturer: 'CameraTech',
          id: 'cam-' + Date.now() + '-1',
          lastSeen: new Date().toISOString()
        },
        {
          name: 'Backyard',
          status: 'online',
          location: 'Backyard',
          ipAddress: '192.168.1.101',
          port: 8080,
          connectionType: 'rtsp',
          rtmpUrl: 'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov',
          recording: true,
          motionDetection: true,
          group: 'Outdoor',
          model: 'VisionCam Pro',
          manufacturer: 'CameraTech',
          id: 'cam-' + Date.now() + '-2',
          lastSeen: new Date().toISOString()
        },
        {
          name: 'Garage',
          status: 'offline',
          location: 'Garage',
          ipAddress: '192.168.1.102',
          port: 8080,
          connectionType: 'ip',
          recording: false,
          group: 'Outdoor',
          model: 'VisionCam Standard',
          manufacturer: 'CameraTech',
          id: 'cam-' + Date.now() + '-3',
          lastSeen: new Date().toISOString()
        },
        {
          name: 'Living Room',
          status: 'online',
          location: 'Living Room',
          ipAddress: '192.168.1.103',
          port: 8080,
          connectionType: 'rtsp',
          rtmpUrl: 'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov',
          recording: true,
          motionDetection: false,
          group: 'Indoor',
          model: 'VisionCam Mini',
          manufacturer: 'CameraTech',
          id: 'cam-' + Date.now() + '-4',
          lastSeen: new Date().toISOString()
        },
        {
          name: 'Kitchen',
          status: 'error',
          location: 'Kitchen',
          ipAddress: '192.168.1.104',
          port: 8080,
          connectionType: 'onvif',
          onvifPath: '/onvif/device_service',
          recording: false,
          group: 'Indoor',
          model: 'VisionCam Mini',
          manufacturer: 'CameraTech',
          id: 'cam-' + Date.now() + '-5',
          lastSeen: new Date().toISOString()
        }
      ];
      
      await syncPublicCamerasToDatabase(publicCameras);
    }
    
    console.log("System initialized with database integration");
    return true;
  } catch (error) {
    console.error("Error initializing system:", error);
    return false;
  }
};

// Add a function to get camera groups
export const getCameraGroups = async () => {
  const cameras = await fetchCamerasFromDB();
  
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
