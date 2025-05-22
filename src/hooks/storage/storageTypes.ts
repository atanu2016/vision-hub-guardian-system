
export interface StorageInfo {
  totalSpace: string;
  usedSpace: string;
  freeSpace: string;
  usedPercentage: number;
  recordings: {
    count: number;
    size: string;
  };
}

export interface Recording {
  id: string;
  cameraId: string;
  cameraName: string;
  date: string;
  time: string;
  duration: number;
  size: string;
  type: 'motion' | 'continuous' | 'manual';
  thumbnailUrl?: string;
  fileUrl?: string;
  isImportant?: boolean;
}
