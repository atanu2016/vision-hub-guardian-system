
export interface StorageUsage {
  totalSpace: number;
  usedSpace: number;
  percentage: number;
  usedPercentage: number;
  usedSpaceFormatted: string;
  totalSpaceFormatted: string;
}

export interface StorageStats {
  used: number;
  total: number;
  percentage: number;
}

export interface StorageInfo {
  used: number;
  total: number;
  percentage: number;
  totalSpace?: number;
  usedSpace?: number;
  freeSpace?: number;
  usagePercentage?: number;
}
