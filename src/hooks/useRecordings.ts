
import { useState, useEffect, useCallback } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from "@/contexts/auth";
import { getUserAssignedCameras } from '@/services/userManagement/cameraAssignment';
import { toast } from "sonner";

// Recording interface from the original file
interface Recording {
  id: string;
  cameraName: string;
  date: string;
  time: string;
  duration: number;
  fileSize: string;
  type: "Scheduled" | "Motion" | "Manual";
  important: boolean;
  thumbnailUrl?: string;
}

// Mock recordings data for development
const mockRecordings: Recording[] = [
  {
    id: "rec1",
    cameraName: "Front Entrance",
    date: "2025-05-17",
    time: "08:00:00",
    duration: 165,
    fileSize: "290 MB",
    type: "Scheduled",
    important: true,
    thumbnailUrl: "/placeholder.svg"
  },
  {
    id: "rec2",
    cameraName: "Front Entrance",
    date: "2025-05-17",
    time: "14:00:00",
    duration: 105,
    fileSize: "128 MB",
    type: "Motion",
    important: false,
    thumbnailUrl: "/placeholder.svg"
  },
  {
    id: "rec3",
    cameraName: "Front Entrance",
    date: "2025-05-17",
    time: "11:00:00",
    duration: 15,
    fileSize: "40 MB",
    type: "Motion",
    important: false,
    thumbnailUrl: "/placeholder.svg"
  },
  {
    id: "rec4",
    cameraName: "Front Entrance",
    date: "2025-05-17",
    time: "18:00:00",
    duration: 45,
    fileSize: "103 MB",
    type: "Motion",
    important: true,
    thumbnailUrl: "/placeholder.svg"
  },
  {
    id: "rec5",
    cameraName: "Parking Lot",
    date: "2025-05-17",
    time: "14:00:00",
    duration: 90,
    fileSize: "151 MB",
    type: "Scheduled",
    important: false,
    thumbnailUrl: "/placeholder.svg"
  },
  {
    id: "rec6",
    cameraName: "Parking Lot",
    date: "2025-05-17",
    time: "16:00:00",
    duration: 120,
    fileSize: "280 MB",
    type: "Manual",
    important: true,
    thumbnailUrl: "/placeholder.svg"
  },
  {
    id: "rec7",
    cameraName: "Parking Lot",
    date: "2025-05-17", 
    time: "08:00:00",
    duration: 105,
    fileSize: "283 MB",
    type: "Scheduled",
    important: false,
    thumbnailUrl: "/placeholder.svg"
  }
];

export interface Camera {
  id: string;
  name: string;
}

export interface StorageInfo {
  used: number;
  total: number;
}

// Format minutes to display as "X minutes"
export const formatDuration = (minutes: number) => {
  return `${minutes} minutes`;
};

export const useRecordings = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [storageUsed, setStorageUsed] = useState<StorageInfo>({ used: 134.5, total: 500 });
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const { role, user } = useAuth();

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

  // Filter recordings by date
  const filterRecordingsByDate = useCallback((date: Date | null) => {
    if (!date) return recordings;
    
    const dateStr = date.toISOString().split('T')[0];
    return recordings.filter((recording) => recording.date === dateStr);
  }, [recordings]);

  useEffect(() => {
    // Immediate authentication check
    if (!user?.id) {
      return;
    }
    
    const loadCamerasAndRecordings = async () => {
      setLoading(true);
      
      try {
        // For observers, get only assigned cameras
        if (role === 'observer') {
          const assignedCameraIds = await getUserAssignedCameras(user.id);
          console.log(`Observer ${user.id} has ${assignedCameraIds.length} assigned cameras`);
          
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
          }));
          
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
            .map(name => ({ id: name.toLowerCase().replace(/\s+/g, '-'), name }));
          
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
  }, [role, user?.id]);

  // Filter recordings based on selected camera, type, and date
  const filteredRecordings = recordings.filter(recording => {
    const matchesCamera = selectedCamera === "all" || recording.cameraName === selectedCamera;
    const matchesType = selectedType === "all" || recording.type.toLowerCase() === selectedType.toLowerCase();
    const matchesDate = !dateFilter || recording.date === dateFilter.toISOString().split('T')[0];
    return matchesCamera && matchesType && matchesDate;
  });

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
    setDateFilter
  };
};
