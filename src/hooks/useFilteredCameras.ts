
import { useMemo } from "react";
import { Camera } from "@/types/camera";

interface CameraGroup {
  id: string;
  name: string;
  cameras: Camera[];
}

export function useFilteredCameras(cameraGroups: CameraGroup[], searchQuery: string) {
  const filteredCameraGroups = useMemo(() => {
    if (!searchQuery) return cameraGroups;
    
    return cameraGroups.map(group => ({
      ...group,
      cameras: group.cameras.filter(camera => 
        camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        camera.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (camera.ipAddress && camera.ipAddress.includes(searchQuery)) ||
        (camera.manufacturer && camera.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (camera.model && camera.model.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    })).filter(group => group.cameras.length > 0);
  }, [cameraGroups, searchQuery]);

  return filteredCameraGroups;
}
