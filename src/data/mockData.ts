
// Importing from apiService instead of providing mock data directly
import { 
  getCameras, 
  getCameraGroups, 
  getSystemStats,
  saveCamera,
  deleteCamera,
  getStorageSettings,
  saveStorageSettings,
  initializeSystem
} from "@/services/apiService";

import { Camera, CameraGroup, StorageSettings } from "@/types/camera";

// Initialize the system with public cameras when loaded
initializeSystem();

// Export wrapper functions that call the API service
export { getCameras, getCameraGroups, getSystemStats, saveCamera, deleteCamera, getStorageSettings, saveStorageSettings };
