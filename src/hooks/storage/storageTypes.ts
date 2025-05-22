
export interface StorageInfo {
  used: number;
  total: number;
  percentage: number;
}

export interface StorageUsage {
  usedSpace: number;
  totalSpace: number;
  percentage: number;
}

export interface RetentionPolicy {
  days: number;
  overwriteOldest: boolean;
}
