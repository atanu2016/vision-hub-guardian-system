
import { useState, useEffect } from "react";

export function useCameraGroups() {
  const [cameraGroups, setCameraGroups] = useState<string[]>([]);
  
  useEffect(() => {
    const getCameraGroupsFromStorage = () => {
      const storedCameras = localStorage.getItem('cameras');
      if (storedCameras) {
        try {
          const cameras = JSON.parse(storedCameras);
          // Filter and map to get only valid string groups
          const groups = Array.from(
            new Set(
              cameras
                .map((c: any) => c.group || "Ungrouped")
                .filter((group: unknown): group is string => 
                  typeof group === 'string' && group !== "Ungrouped"
                )
            )
          ) as string[]; // Explicitly cast the result to string[]
          
          setCameraGroups(groups);
        } catch (err) {
          console.error("Error parsing camera data:", err);
          setCameraGroups([]);
        }
      }
    };
    
    // Get initial groups
    getCameraGroupsFromStorage();
    
    // Set up listener for changes
    window.addEventListener('storage', getCameraGroupsFromStorage);
    
    // Clean up
    return () => {
      window.removeEventListener('storage', getCameraGroupsFromStorage);
    };
  }, []);

  return cameraGroups;
}
