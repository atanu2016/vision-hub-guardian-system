
import { useMemo } from "react";
import { GroupedCameras, Camera } from "@/types/camera";

export function useFilteredCameras(cameraGroups: GroupedCameras[], searchQuery: string = ""): GroupedCameras[] {
  // Filter cameras based on search query
  return useMemo(() => {
    if (!searchQuery.trim()) {
      return cameraGroups;
    }
    
    const query = searchQuery.toLowerCase();
    
    return cameraGroups
      .map(group => {
        // Filter cameras within the group by name or location
        const filteredCameras = group.cameras.filter(camera => 
          camera.name.toLowerCase().includes(query) || 
          (camera.location && camera.location.toLowerCase().includes(query))
        );
        
        // Return a new group object with only matching cameras
        return {
          ...group,
          cameras: filteredCameras
        };
      })
      .filter(group => group.cameras.length > 0); // Remove empty groups
  }, [cameraGroups, searchQuery]);
}
