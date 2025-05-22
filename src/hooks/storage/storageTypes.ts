
export interface StorageInfo {
  used: number;
  total: number;
  percentage: number;
}

export interface StorageUsage {
  usedSpace: number;
  totalSpace: number;
  percentage: number;
  usedPercentage: number;
  usedSpaceFormatted: string;
  totalSpaceFormatted: string;
}

export interface RetentionPolicy {
  days: number;
  overwriteOldest: boolean;
}

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
