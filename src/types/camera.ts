
// Camera types
export type CameraConnectionType = "ip" | "rtsp" | "rtmp" | "onvif" | "hls";
export type CameraStatus = "online" | "offline" | "error";
export type StorageProviderType = "local" | "nas" | "s3" | "dropbox" | "google_drive" | "onedrive" | "azure_blob" | "backblaze";
export type QualityType = 'low' | 'medium' | 'high' | 'ultra';
export type ScheduleType = 'always' | 'workdays' | 'weekends' | 'custom';

export interface Camera {
  id: string;
  name: string;
  status: CameraStatus;
  location: string;
  ipAddress: string;
  port?: number;
  username?: string;
  password?: string;
  model?: string;
  manufacturer?: string;
  lastSeen: string; // ISO date string
  recording: boolean;
  thumbnail?: string;
  group?: string;
  connectionType?: CameraConnectionType;
  rtmpUrl?: string;
  rtspUrl?: string; // Added RTSP URL field
  hlsUrl?: string; // Added HLS URL field
  onvifPath?: string;
  motionDetection?: boolean;
  
  // Recording settings properties
  quality?: QualityType; 
  scheduleType?: ScheduleType;
  timeStart?: string;
  timeEnd?: string;
  daysOfWeek?: string[];
}

export interface CameraGroup {
  id: string;
  name: string;
  description?: string;
}

export interface GroupedCameras {
  [groupName: string]: Camera[];
}

export interface StorageSettings {
  type: StorageProviderType;
  path?: string;
  retentionDays: number;
  overwriteOldest: boolean;
  
  // NAS settings
  nasAddress?: string;
  nasPath?: string;
  nasUsername?: string;
  nasPassword?: string;
  
  // S3 settings
  s3Endpoint?: string;
  s3Bucket?: string; 
  s3AccessKey?: string;
  s3SecretKey?: string;
  s3Region?: string;

  // Dropbox settings
  dropboxToken?: string;
  dropboxFolder?: string;

  // Google Drive settings
  googleDriveToken?: string;
  googleDriveFolderId?: string;

  // OneDrive settings
  oneDriveToken?: string;
  oneDriveFolderId?: string;

  // Azure Blob Storage settings
  azureConnectionString?: string;
  azureContainer?: string;

  // Backblaze settings
  backblazeKeyId?: string;
  backblazeApplicationKey?: string;
  backblazeBucket?: string;
}
