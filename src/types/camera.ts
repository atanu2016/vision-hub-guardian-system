
export interface Camera {
  id: string;
  name: string;
  ipaddress: string;
  port?: number;
  username?: string;
  password?: string;
  location: string;
  status: CameraStatus;
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
  schedule_type?: string;
  time_start?: string;
  time_end?: string;
  days_of_week?: string[];
}

export type CameraConnectionType = 'ip' | 'rtsp' | 'rtmp' | 'onvif' | 'hls';

export type CameraStatus = 'online' | 'offline' | 'recording';

export interface GroupedCameras {
  id: string;
  name: string;
  cameras: Camera[];
}

export interface StorageSettings {
  id?: string;
  type: 'local' | 'nas' | 's3' | 'dropbox' | 'google_drive' | 'onedrive' | 'azure_blob' | 'backblaze';
  path?: string;
  retentiondays: number;
  overwriteoldest: boolean;
  nasaddress?: string;
  naspath?: string;
  nasusername?: string;
  naspassword?: string;
  s3endpoint?: string;
  s3bucket?: string;
  s3accesskey?: string;
  s3secretkey?: string;
  s3region?: string;
  dropboxtoken?: string;
  dropboxfolder?: string;
  googledrivertoken?: string;
  googledrivefolderid?: string;
  onedrivetoken?: string;
  onedrivefolderid?: string;
  azureconnectionstring?: string;
  azurecontainer?: string;
  backblazekeyid?: string;
  backblazeapplicationkey?: string;
  backblazebucket?: string;
}

export interface CameraGroup {
  id: string;
  name: string;
  cameras: string[];
}

export type QualityType = 'low' | 'medium' | 'high' | 'ultra';
export type ScheduleType = 'always' | 'workdays' | 'weekends' | 'custom';
