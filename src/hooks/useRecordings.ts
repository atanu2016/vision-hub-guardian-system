
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Camera } from "@/types/camera"; // Using type import
import { useRecordingsStorage } from "@/hooks/storage";
import { formatDuration } from "@/hooks/recordings/utils";
import type { Recording, StorageInfo } from "@/hooks/recordings/types"; // Using type import

export { formatDuration };
export type { Camera, Recording, StorageInfo }; // Using type exports for re-exports

export interface RecordingsHookResult {
  recordings: Recording[];
  filteredRecordings: Recording[];
  selectedCamera: string;
  setSelectedCamera: (camera: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  loading: boolean;
  cameras: Camera[];
  storageUsed: StorageInfo;
  deleteRecording: (recordingId: string) => Promise<void>;
  filterRecordingsByDate: (date: Date | null) => void;
  dateFilter: Date | null;
  setDateFilter: (date: Date | null) => void;
  fetchActualStorageUsage: () => Promise<void>;
}

export const useRecordings = (): RecordingsHookResult => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [filteredRecordings, setFilteredRecordings] = useState<Recording[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [dateFilter, setDateFilter] = useState<Date | null>(null);

  useEffect(() => {
    fetchCameras();
    fetchRecordings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [recordings, selectedCamera, selectedType, dateFilter]);

  const fetchCameras = async () => {
    try {
      const { data, error } = await supabase
        .from('cameras')
        .select('*');

      if (error) {
        console.error("Error fetching cameras:", error);
      }

      if (data) {
        const camerasFormatted: Camera[] = data.map(cam => ({
          id: cam.id,
          name: cam.name,
          status: cam.status as "online" | "offline" | "error",
          location: cam.location,
          ipAddress: cam.ipaddress,
          port: cam.port || 80,
          username: cam.username || undefined,
          password: cam.password || undefined,
          model: cam.model || undefined,
          manufacturer: cam.manufacturer || undefined,
          lastSeen: cam.lastseen,
          recording: cam.recording || false,
          thumbnail: cam.thumbnail || undefined,
          group: cam.group || undefined,
          connectionType: (cam.connectiontype as "ip" | "rtsp" | "rtmp" | "onvif" | "hls") || "ip"
        }));
        setCameras(camerasFormatted);
      }
    } catch (error) {
      console.error("Failed to fetch cameras:", error);
    }
  };

  const fetchRecordings = async () => {
    setLoading(true);
    try {
      // Since 'recordings' table might not exist in the database yet,
      // let's use mock data for now
      const mockData: Recording[] = [
        {
          id: "1",
          cameraName: "Front Door",
          date: "2025-05-19",
          time: "08:30:00",
          duration: 15, // Changed to number
          fileSize: "45 MB",
          type: "Motion",
          important: true,
          thumbnailUrl: "/placeholder.svg",
          dateTime: "2025-05-19T08:30:00"
        },
        {
          id: "2",
          cameraName: "Backyard",
          date: "2025-05-19",
          time: "10:15:00",
          duration: 30, // Changed to number
          fileSize: "90 MB",
          type: "Scheduled",
          important: false,
          thumbnailUrl: "/placeholder.svg",
          dateTime: "2025-05-19T10:15:00"
        },
        {
          id: "3",
          cameraName: "Living Room",
          date: "2025-05-18",
          time: "14:45:00",
          duration: 10, // Changed to number
          fileSize: "30 MB",
          type: "Manual",
          important: false,
          thumbnailUrl: "/placeholder.svg",
          dateTime: "2025-05-18T14:45:00"
        },
        {
          id: "4",
          cameraName: "Garage",
          date: "2025-05-18",
          time: "20:00:00",
          duration: 25, // Changed to number
          fileSize: "75 MB",
          type: "Motion",
          important: true,
          thumbnailUrl: "/placeholder.svg",
          dateTime: "2025-05-18T20:00:00"
        }
      ];
      
      setRecordings(mockData);
    } catch (error) {
      console.error("Failed to fetch recordings:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...recordings];

    if (selectedCamera !== "all") {
      filtered = filtered.filter(
        (recording) => recording.cameraName === selectedCamera
      );
    }

    if (selectedType !== "all") {
      filtered = filtered.filter(
        (recording) => recording.type.toLowerCase() === selectedType.toLowerCase()
      );
    }
    
    if (dateFilter) {
      filtered = filtered.filter(recording => {
        const recordingDate = new Date(recording.dateTime).toDateString();
        const filterDate = dateFilter.toDateString();
        return recordingDate === filterDate;
      });
    }

    setFilteredRecordings(filtered);
  };
  
  const filterRecordingsByDate = (date: Date | null) => {
    setDateFilter(date);
  };

  const deleteRecording = async (recordingId: string) => {
    try {
      // In a real implementation, this would send a request to your server
      // For now, just update the local state
      setRecordings(prevRecordings => 
        prevRecordings.filter(recording => recording.id !== recordingId)
      );
      setFilteredRecordings(prevRecordings => 
        prevRecordings.filter(recording => recording.id !== recordingId)
      );
      
      // Update storage calculations
      updateStorageAfterDelete(recordings as any, recordingId);
    } catch (error) {
      console.error("Failed to delete recording:", error);
    }
  };

  const {
    storageUsed,
    updateStorageAfterDelete,
    fetchActualStorageUsage
  } = useRecordingsStorage(recordings as any);

  return {
    recordings,
    filteredRecordings,
    selectedCamera,
    setSelectedCamera,
    selectedType,
    setSelectedType,
    loading,
    cameras,
    storageUsed,
    deleteRecording,
    filterRecordingsByDate,
    dateFilter,
    setDateFilter,
    fetchActualStorageUsage
  };
};
