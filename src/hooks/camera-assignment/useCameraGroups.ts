
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GroupedCameras } from '@/types/camera';
import { Camera as AssignmentCamera } from '@/components/admin/camera-assignment/types';

export function useCameraGroups(cameras: AssignmentCamera[]) {
  const [groupedCameras, setGroupedCameras] = useState<Record<string, AssignmentCamera[]>>({});
  
  // Group cameras by their group property
  useEffect(() => {
    if (!cameras || cameras.length === 0) return;
    
    const grouped: Record<string, AssignmentCamera[]> = {};
    
    // First add "All Cameras" group
    grouped['All Cameras'] = [...cameras];
    
    // Then group by camera.group property
    cameras.forEach(camera => {
      const groupName = camera.group || 'Ungrouped';
      
      if (!grouped[groupName]) {
        grouped[groupName] = [];
      }
      
      grouped[groupName].push(camera);
    });
    
    setGroupedCameras(grouped);
  }, [cameras]);

  // Function to get all available groups
  const getAvailableGroups = (): string[] => {
    return Object.keys(groupedCameras);
  };

  // Function to get cameras by group
  const getCamerasByGroup = (groupName: string): AssignmentCamera[] => {
    if (groupName === 'All Cameras') {
      return cameras;
    }
    return groupedCameras[groupName] || [];
  };

  // Function to update camera group
  const updateCameraGroup = async (cameraId: string, groupName: string) => {
    try {
      const { error } = await supabase
        .from('cameras')
        .update({ group: groupName })
        .eq('id', cameraId);
        
      if (error) throw error;
      
      // Update local state
      setGroupedCameras(prev => {
        const newGrouped = { ...prev };
        
        // Find the camera in all groups and update its group
        Object.keys(newGrouped).forEach(group => {
          const cameraIndex = newGrouped[group].findIndex(cam => cam.id === cameraId);
          if (cameraIndex >= 0) {
            const camera = { ...newGrouped[group][cameraIndex], group: groupName };
            
            // Remove from current group
            newGrouped[group] = newGrouped[group].filter(cam => cam.id !== cameraId);
            
            // Add to new group
            if (!newGrouped[groupName]) {
              newGrouped[groupName] = [];
            }
            newGrouped[groupName].push(camera);
          }
        });
        
        return newGrouped;
      });
      
      return true;
    } catch (error: any) {
      console.error("Error updating camera group:", error);
      toast.error("Failed to update camera group");
      return false;
    }
  };

  return {
    groupedCameras,
    getAvailableGroups,
    getCamerasByGroup,
    updateCameraGroup
  };
}
