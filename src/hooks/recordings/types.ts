
import { Camera as BaseCamera } from "@/types/camera";

export interface Recording {
  id: string;
  cameraId?: string;
  cameraName: string;
  date: string;
  time: string;
  duration: number;
  fileSize: string;
  size?: number;
  type: "Scheduled" | "Motion" | "Manual";
  important: boolean;
  thumbnailUrl: string;
  dateTime: string;
}

export interface Camera {
  id: string;
  name: string;
  status: "online" | "offline" | "recording";
  location: string;
  ipAddress: string;
  lastSeen: string;
  recording: boolean;
  // Add these properties to make it compatible with the base Camera type
  ipaddress?: string;
  lastseen?: string;
}

export interface StorageInfo {
  used: number;
  total: number;
  percentage: number;
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
  fetchActualStorageUsage?: () => Promise<void>;
}
