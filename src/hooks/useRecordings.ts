
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDuration } from "@/hooks/recordings/utils";
import { useCamerasFetch } from "@/hooks/recordings/useCamerasFetch";
import { useRecordingsFilter } from "@/hooks/recordings/useRecordingsFilter";
import { useRecordingsStorage } from "@/hooks/storage";
import type { Recording, StorageInfo, UseRecordingsReturn } from "@/hooks/recordings/types";

export { formatDuration };
export type { Recording, StorageInfo };

export const useRecordings = (): UseRecordingsReturn => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Use the new hooks
  const { cameras, loading: camerasLoading } = useCamerasFetch();
  const { 
    filteredRecordings, 
    selectedCamera, 
    setSelectedCamera, 
    selectedType, 
    setSelectedType,
    dateFilter,
    setDateFilter,
    filterRecordingsByDate
  } = useRecordingsFilter(recordings);

  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('recordings')
        .select('*')
        .order('date_time', { ascending: false });
        
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
      console.error("Failed to fetch recordings:", error);
      toast.error("Failed to fetch recordings");
    } finally {
      setLoading(false);
    }
  };

  const deleteRecording = async (recordingId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('recordings')
        .delete()
        .eq('id', recordingId);
        
      if (error) {
        throw error;
      }
      
      // Update local state after successful deletion
      setRecordings(prevRecordings => 
        prevRecordings.filter(recording => recording.id !== recordingId)
      );
      
      // Update storage calculations
      updateStorageAfterDelete(recordings, recordingId);
      toast.success("Recording deleted successfully");
      return true;
    } catch (error) {
      console.error("Failed to delete recording:", error);
      toast.error("Failed to delete recording");
      return false;
    }
  };

  const {
    storageUsed,
    updateStorageAfterDelete,
    fetchActualStorageUsage
  } = useRecordingsStorage(recordings);

  return {
    recordings,
    filteredRecordings,
    selectedCamera,
    setSelectedCamera,
    selectedType,
    setSelectedType,
    loading: loading || camerasLoading,
    cameras,
    storageUsed,
    deleteRecording,
    filterRecordingsByDate,
    dateFilter,
    setDateFilter,
    fetchActualStorageUsage
  };
};
