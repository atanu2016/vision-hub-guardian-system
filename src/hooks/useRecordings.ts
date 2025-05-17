
import { useState, useEffect } from "react";

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

// Later this should be fetched from an actual API
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

  useEffect(() => {
    // Simulate API call to get recordings and cameras
    setTimeout(() => {
      setRecordings(mockRecordings);
      
      // Extract unique cameras from recordings
      const uniqueCameras = Array.from(new Set(mockRecordings.map(r => r.cameraName)))
        .map(name => ({ id: name.toLowerCase().replace(/\s+/g, '-'), name }));
      
      setCameras(uniqueCameras);
      setLoading(false);
    }, 1000);
  }, []);

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
