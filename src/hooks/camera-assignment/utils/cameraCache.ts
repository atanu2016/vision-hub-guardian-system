
import { Camera } from '@/components/admin/camera-assignment/types';

// Cache TTL in milliseconds (5 minutes)
export const CACHE_TTL = 5 * 60 * 1000;

// Cache structure for storing camera data to prevent unnecessary reloads
export const cameraCache = new Map<string, {
  cameras: Camera[],
  timestamp: number,
  assignments: string[]
}>();

/**
 * Checks if the cache for a given key is valid
 */
export const isCacheValid = (
  cacheKey: string, 
  lastFetchTime: number
): boolean => {
  const now = Date.now();
  const cachedData = cameraCache.get(cacheKey);
  
  // Use cache if it's still valid and we haven't fetched recently
  return Boolean(
    cachedData && 
    (now - cachedData.timestamp) < CACHE_TTL && 
    (now - lastFetchTime) > 1000
  );
};

/**
 * Updates the camera cache with new data
 */
export const updateCache = (
  cacheKey: string, 
  cameras: Camera[], 
  assignedCameraIds: string[]
): void => {
  cameraCache.set(cacheKey, {
    cameras,
    timestamp: Date.now(),
    assignments: assignedCameraIds
  });
};
