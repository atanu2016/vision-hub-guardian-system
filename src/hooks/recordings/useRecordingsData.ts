
import { useState, useEffect, useCallback } from "react";
import { supabase } from '@/integrations/supabase/client';
import { getUserAssignedCameras } from '@/services/userManagement/cameraAssignment';
import { toast } from "sonner";
import { Camera } from "@/types/camera";
import { Recording, StorageInfo } from "./types";
import { mockRecordings } from "./mockData";

export const useRecordingsData = (userId?: string, userRole?: string) => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [storageUsed, setStorageUsed] = useState<StorageInfo>({ used: 134.5, total: 500 });

  // Function to delete a recording
  const deleteRecording = useCallback(async (id: string) => {
    try {
      // In a real implementation, this would send a request to your server
      setRecordings((prev) => prev.filter((recording) => recording.id !== id));
      
      // Simulating a deletion request
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // In a production environment, you would make an API call here
      // const { error } = await supabase.from('recordings').delete().eq('id', id);
      // if (error) throw error;
      
      // Update storage used
      setStorageUsed((prev) => {
        const deletedRecording = recordings.find((r) => r.id === id);
        if (deletedRecording) {
          const sizeInMB = parseFloat(deletedRecording.fileSize.replace(' MB', ''));
          const sizeInGB = sizeInMB / 1000;
          return {
            ...prev,
            used: Math.max(0, prev.used - sizeInGB)
          };
        }
        return prev;
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting recording:', error);
      toast.error('Failed to delete recording');
      return false;
    }
  }, [recordings]);

  useEffect(() => {
    // Skip loading if no user ID
    if (!userId) {
      return;
    }
    
    const loadCamerasAndRecordings = async () => {
      setLoading(true);
      
      try {
        // For observers, get only assigned cameras
        if (userRole === 'observer') {
          const assignedCameraIds = await getUserAssignedCameras(userId);
          console.log(`Observer ${userId} has ${assignedCameraIds.length} assigned cameras`);
          
          if (assignedCameraIds.length === 0) {
            // No cameras assigned, return empty data
            setCameras([]);
            setRecordings([]);
            setLoading(false);
            return;
          }
          
          // Fetch camera details for assigned cameras
          const { data: cameraData, error: cameraError } = await supabase
            .from('cameras')
            .select('id, name')
            .in('id', assignedCameraIds);
            
          if (cameraError) {
            console.error("Error fetching assigned cameras:", cameraError);
            return;
          }
          
          // Transform to expected format
          const uniqueCameras = cameraData.map(cam => ({
            id: cam.id,
            name: cam.name
          } as Camera));
          
          setCameras(uniqueCameras);
          
          // Filter mock recordings to only show those from assigned cameras
          const cameraNames = uniqueCameras.map(cam => cam.name);
          const filteredRecordings = mockRecordings.filter(
            rec => cameraNames.includes(rec.cameraName)
          );
          
          setRecordings(filteredRecordings);
        } else {
          // For non-observers (admin, etc.), show all cameras and recordings
          // Extract unique cameras from recordings
          const uniqueCameras = Array.from(new Set(mockRecordings.map(r => r.cameraName)))
            .map(name => ({ 
              id: name.toLowerCase().replace(/\s+/g, '-'), 
              name 
            } as Camera));
          
          setCameras(uniqueCameras);
          setRecordings(mockRecordings);
        }
      } catch (error) {
        console.error("Error loading camera access data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCamerasAndRecordings();
  }, [userRole, userId]);

  return {
    recordings,
    setRecordings,
    loading,
    cameras,
    storageUsed,
    deleteRecording
  };
};
