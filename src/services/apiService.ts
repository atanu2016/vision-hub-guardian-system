
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

// Re-export all database functions with more intuitive names
export const getCameras = fetchCamerasFromDB;
export const getSystemStats = fetchSystemStatsFromDB;
export const saveCamera = saveCameraToDB;
export const deleteCamera = deleteCameraFromDB;
export const getStorageSettings = fetchStorageSettingsFromDB;
export const saveStorageSettings = saveStorageSettingsToDB;

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
          manufacturer: 'CameraTech'
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
          manufacturer: 'CameraTech'
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
          manufacturer: 'CameraTech'
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
          manufacturer: 'CameraTech'
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
          manufacturer: 'CameraTech'
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
