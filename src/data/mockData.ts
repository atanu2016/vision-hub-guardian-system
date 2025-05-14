
// Importing from apiService instead of providing mock data directly
import { 
  getCamerasFromAPI, 
  getCameraGroupsFromAPI, 
  getSystemStatsFromAPI,
  saveCameraToAPI,
  deleteCameraFromAPI,
  getStorageSettingsFromAPI,
  saveStorageSettingsToAPI,
  initializeSystem
} from "@/services/apiService";

import { Camera, CameraGroup, StorageSettings } from "@/types/camera";

// Initialize the system with public cameras when loaded
initializeSystem();

// Export wrapper functions that call the API service
export const getCameras = async (): Promise<Camera[]> => {
  return await getCamerasFromAPI();
};

export const getCameraGroups = async (): Promise<CameraGroup[]> => {
  return await getCameraGroupsFromAPI();
};

export const getSystemStats = async () => {
  return await getSystemStatsFromAPI();
};

export const saveCamera = async (camera: Camera): Promise<Camera> => {
  return await saveCameraToAPI(camera);
};

export const deleteCamera = async (cameraId: string): Promise<void> => {
  return await deleteCameraFromAPI(cameraId);
};

export const getStorageSettings = async (): Promise<StorageSettings> => {
  return await getStorageSettingsFromAPI();
};

export const saveStorageSettings = async (settings: StorageSettings): Promise<StorageSettings> => {
  return await saveStorageSettingsToAPI(settings);
};
