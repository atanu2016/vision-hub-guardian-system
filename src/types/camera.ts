
export interface Camera {
  id: string;
  name: string;
  ipaddress: string;
  port?: number;
  username?: string;
  password?: string;
  location: string;
  status: 'online' | 'offline' | 'recording';
  lastseen: string;
  recording?: boolean;
  motiondetection?: boolean;
  rtmpurl?: string;
  hlsurl?: string;
  onvifpath?: string;
  connectiontype?: string;
  group?: string;
  thumbnail?: string;
  manufacturer?: string;
  model?: string;
  quality?: string;
  scheduleType?: string;
  timeStart?: string;
  timeEnd?: string;
  daysOfWeek?: string[];
}

export type CameraConnectionType = 'ip' | 'rtsp' | 'rtmp' | 'hls' | 'onvif';

export type CameraStatus = 'online' | 'offline' | 'recording';

export interface GroupedCameras {
  id: string;
  name: string;
  cameras: Camera[];
}

export interface StorageSettings {
  type: 'local' | 'nas' | 's3' | 'dropbox' | 'google_drive' | 'onedrive' | 'azure_blob' | 'backblaze';
  path?: string;
  retentionDays: number;
  overwriteOldest: boolean;
  nasAddress?: string;
  nasPath?: string;
  nasUsername?: string;
  nasPassword?: string;
  s3Endpoint?: string;
  s3Bucket?: string;
  s3AccessKey?: string;
  s3SecretKey?: string;
  s3Region?: string;
  dropboxToken?: string;
  dropboxFolder?: string;
  googleDriveToken?: string;
  googleDriveFolderId?: string;
  oneDriveToken?: string;
  oneDriveFolderId?: string;
  azureConnectionString?: string;
  azureContainer?: string;
  backblazeKeyId?: string;
  backblazeApplicationKey?: string;
  backblazeBucket?: string;
}

export interface CameraGroup {
  id: string;
  name: string;
  cameras: string[];
}

export type QualityType = 'low' | 'medium' | 'high' | 'ultra';
export type ScheduleType = 'always' | 'workdays' | 'weekends' | 'custom';
