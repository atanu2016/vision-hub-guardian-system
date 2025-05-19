
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Recording } from "./types";
import { mockRecordings } from "./mockData";
import { useAssignedCameras } from "./camera/useAssignedCameras";
import { useStorageData } from "./storage/useStorageData";
import { useRecordingOperations } from "./operations/useRecordingOperations";

export const useRecordingsData = (userId?: string, userRole?: string) => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get cameras from the camera hook
  const { cameras, loading: camerasLoading } = useAssignedCameras(userId, userRole);
  
  // Get storage data management
  const { storageUsed, updateStorageAfterDelete } = useStorageData(recordings);
  
  // Get recording operations
  const { deleteRecording } = useRecordingOperations(
    recordings, 
    setRecordings, 
    updateStorageAfterDelete
  );

  useEffect(() => {
    // Skip loading if no user ID
    if (!userId) {
      return;
    }
    
    const loadRecordings = async () => {
      setLoading(true);
      
      try {
        if (userRole === 'observer' && cameras.length === 0) {
          // No cameras assigned, return empty data
          setRecordings([]);
          setLoading(false);
          return;
        }
        
        if (userRole === 'observer') {
          // Filter mock recordings to only show those from assigned cameras
          const cameraNames = cameras.map(cam => cam.name);
          const filteredRecordings = mockRecordings.filter(
            rec => cameraNames.includes(rec.cameraName)
          );
          
          setRecordings(filteredRecordings);
        } else {
          // For non-observers (admin, etc.), show all recordings
          setRecordings(mockRecordings);
        }
      } catch (error) {
        console.error("Error loading recordings data:", error);
        toast.error("Failed to load recordings");
      } finally {
        setLoading(false);
      }
    };

    // Only load recordings once cameras are loaded
    if (!camerasLoading) {
      loadRecordings();
    }
  }, [userRole, userId, cameras, camerasLoading]);

  return {
    recordings,
    setRecordings,
    loading,
    cameras,
    storageUsed,
    deleteRecording
  };
};
