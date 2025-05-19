
import { CameraStatus } from "@/types/camera";

export interface Recording {
  id: string;
  cameraName: string;
  date: string;
  time: string;
  duration: number;
  fileSize: string;
  type: "Scheduled" | "Motion" | "Manual";
  important: boolean;
  thumbnailUrl?: string;
  dateTime: string;
}

export interface Camera {
  id: string;
  name: string;
  status: CameraStatus;
  location: string;
  ipAddress: string;
  lastSeen: string;
  recording: boolean;  // Changed from optional to required to match type in @/types/camera
}

export interface StorageInfo {
  used: number;
  total: number;
}

export interface UseRecordingsReturn {
  recordings: Recording[];
  filteredRecordings: Recording[];
  selectedCamera: string;
  setSelectedCamera: (camera: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  loading: boolean;
  cameras: Camera[];
  storageUsed: StorageInfo;
  deleteRecording: (id: string) => Promise<boolean>;
  filterRecordingsByDate: (date: Date | null) => void;
  dateFilter: Date | null;
  setDateFilter: (date: Date | null) => void;
  fetchActualStorageUsage: () => Promise<void>;
}
