
export interface StorageUsage {
  totalSpace: number;
  usedSpace: number;
  usedPercentage: number;
  usedSpaceFormatted: string;
  totalSpaceFormatted: string;
}

export interface StorageInfo {
  used: number;
  total: number;
}

export interface Recording {
  id: string;
  cameraName: string;
  dateTime: string;
  duration: number;  // Changed to number
  fileSize: string;
  thumbnail?: string;
  type: string;
  date?: string;
  time?: string;
  important?: boolean;
  thumbnailUrl?: string; // Added to match recordings type
}
