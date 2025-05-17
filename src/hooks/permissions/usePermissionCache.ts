
import { useRef } from "react";
import { PermissionCache } from "./types";

export function usePermissionCache(cacheTimeoutMs: number = 10000) {
  const permissionCacheRef = useRef<PermissionCache>({});
  
  const getCachedPermission = (cacheKey: string) => {
    const now = Date.now();
    const cached = permissionCacheRef.current[cacheKey];
    
    if (cached && (now - cached.timestamp < cacheTimeoutMs)) {
      return cached.result;
    }
    
    return null;
  };
  
  const setCachedPermission = (cacheKey: string, result: boolean) => {
    permissionCacheRef.current[cacheKey] = {
      timestamp: Date.now(),
      result
    };
  };
  
  const clearCache = () => {
    permissionCacheRef.current = {};
  };
  
  return {
    getCachedPermission,
    setCachedPermission,
    clearCache
  };
}
