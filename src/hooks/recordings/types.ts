
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
