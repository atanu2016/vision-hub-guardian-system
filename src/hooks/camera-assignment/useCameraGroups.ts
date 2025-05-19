
import { useMemo } from 'react';
import { Camera } from '@/components/admin/camera-assignment/types';

export function useCameraGroups(cameras: Camera[]) {
  // Get all available camera groups
  const getAvailableGroups = useMemo(() => {
    return () => {
      const groups = ['All Cameras'];
      
      // Add unique group names
      cameras.forEach(camera => {
        const groupName = camera.group || 'Uncategorized';
        if (!groups.includes(groupName)) {
          groups.push(groupName);
        }
      });
      
      return groups;
    };
  }, [cameras]);

  // Get cameras by group name
  const getCamerasByGroup = useMemo(() => {
    return (groupName: string) => {
      if (groupName === 'All Cameras') {
        return cameras;
      }
      
      return cameras.filter(camera => {
        const cameraGroup = camera.group || 'Uncategorized';
        return cameraGroup === groupName;
      });
    };
  }, [cameras]);

  // Group cameras by their groups
  const groupedCameras = useMemo(() => {
    const groups: Record<string, Camera[]> = {};
    
    // Initialize with empty arrays for each unique group
    const uniqueGroups = getAvailableGroups().filter(group => group !== 'All Cameras');
    uniqueGroups.forEach(group => {
      groups[group] = [];
    });
    
    // Populate groups with cameras
    cameras.forEach(camera => {
      const groupName = camera.group || 'Uncategorized';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(camera);
    });
    
    return groups;
  }, [cameras, getAvailableGroups]);

  return {
    getAvailableGroups,
    getCamerasByGroup,
    groupedCameras
  };
}
