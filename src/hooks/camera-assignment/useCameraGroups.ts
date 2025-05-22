
import { useMemo } from 'react';
import { Camera } from '@/components/admin/camera-assignment/types';
import { GroupedCameras } from '@/types/camera';

export function useCameraGroups(cameras: Camera[]) {
  // Group cameras by their group property
  const groupedCameras = useMemo(() => {
    const result: Record<string, Camera[]> = {};
    
    cameras.forEach(camera => {
      const groupName = camera.group || 'Ungrouped';
      if (!result[groupName]) {
        result[groupName] = [];
      }
      result[groupName].push(camera);
    });
    
    // Convert to array format for easier consumption
    return Object.entries(result).map(([name, groupCameras]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      cameras: groupCameras
    })) as unknown as GroupedCameras[]; // Type assertion for compatibility
  }, [cameras]);
  
  // Get available group names
  const getAvailableGroups = () => {
    return Array.from(new Set(cameras.map(camera => camera.group || 'Ungrouped')));
  };
  
  // Get cameras for a specific group
  const getCamerasByGroup = (group: string): Camera[] => {
    return cameras.filter(camera => (camera.group || 'Ungrouped') === group);
  };
  
  return {
    groupedCameras,
    getAvailableGroups,
    getCamerasByGroup
  };
}
