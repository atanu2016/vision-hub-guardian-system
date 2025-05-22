
import { Camera, CameraStatus } from "@/types/camera";

export interface RecordingDateData {
  date: string;
  recordingsCount: number;
  cameras: {
    id: string;
    name: string;
    recordingsCount: number;
  }[];
}

export interface RecordingTimeRange {
  start: string;
  end: string;
}

export interface RecordingCalendarDate {
  date: string;
  hasRecordings: boolean;
  count: number;
}

// Re-export Camera and CameraStatus for convenience
export type { Camera, CameraStatus };

// Additional types for recordings
export interface Recording {
  id: string;
  cameraId: string;
  cameraName: string;
  date: string;
  time: string;
  duration: number;
  size: string;
  fileSize: string;
  type: 'motion' | 'continuous' | 'manual';
  thumbnailUrl?: string;
  fileUrl?: string;
  isImportant?: boolean;
}

export interface StorageInfo {
  totalSpace: string;
  usedSpace: string;
  freeSpace: string;
  usedPercentage: number;
  used?: string;
  recordings: {
    count: number;
    size: string;
  };
}

export interface UseRecordingsReturn {
  recordings: Recording[];
  loading: boolean;
  error: string | null;
  deleteRecording: (id: string) => Promise<void>;
  markAsImportant: (id: string, important: boolean) => Promise<void>;
  downloadRecording: (id: string) => Promise<void>;
  storageInfo: StorageInfo;
}
