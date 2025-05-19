
import { useState, useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from "@/contexts/auth";
import { getUserAssignedCameras } from '@/services/userManagement/cameraAssignment';

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
  const { role, user } = useAuth();

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

  // Filter recordings based on selected camera and type
  const filteredRecordings = recordings.filter(recording => {
    const matchesCamera = selectedCamera === "all" || recording.cameraName === selectedCamera;
    const matchesType = selectedType === "all" || recording.type.toLowerCase() === selectedType.toLowerCase();
    return matchesCamera && matchesType;
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
    storageUsed
  };
};
