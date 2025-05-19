
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Recording } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { useAssignedCameras } from "./camera/useAssignedCameras";
import { useRecordingsStorage } from "../storage/useRecordingsStorage";
import { useRecordingOperations } from "./operations/useRecordingOperations";

export const useRecordingsData = (userId?: string, userRole?: string) => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get cameras from the camera hook
  const { cameras, loading: camerasLoading } = useAssignedCameras(userId, userRole);
  
  // Get storage data management
  // Cast recordings to match expected type for useRecordingsStorage
  const { storageUsed, updateStorageAfterDelete } = useRecordingsStorage(recordings as any);
  
  // Get recording operations
  const { deleteRecording } = useRecordingOperations(
    recordings, 
    setRecordings, 
    (recs: Recording[], id: string) => updateStorageAfterDelete(recs as any, id)
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

        let query = supabase
          .from('recordings')
          .select('*')
          .order('date_time', { ascending: false });
          
        if (userRole === 'observer') {
          // Filter recordings to only show those from assigned cameras
          const cameraNames = cameras.map(cam => cam.name);
          query = query.in('camera_name', cameraNames);
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        if (data) {
          const formattedRecordings: Recording[] = data.map(rec => ({
            id: rec.id,
            cameraName: rec.camera_name,
            date: rec.date,
            time: rec.time,
            duration: rec.duration,
            fileSize: rec.file_size,
            type: rec.type as "Scheduled" | "Motion" | "Manual",
            important: rec.important,
            thumbnailUrl: rec.thumbnail_url || "/placeholder.svg",
            dateTime: rec.date_time
          }));
          
          setRecordings(formattedRecordings);
        } else {
          setRecordings([]);
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
