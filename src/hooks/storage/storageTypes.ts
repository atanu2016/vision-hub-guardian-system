
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
  duration: string;
  fileSize: string;
  thumbnail: string;
  type: string;
}
