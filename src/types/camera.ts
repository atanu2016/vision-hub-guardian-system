
// Camera types
export type CameraConnectionType = "ip" | "rtsp" | "rtmp" | "onvif";
export type CameraStatus = "online" | "offline" | "error";

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
  onvifPath?: string;
  motionDetection?: boolean;
}

export interface CameraGroup {
  id: string;
  name: string;
  cameras: Camera[];
}

export interface StorageSettings {
  type: "local" | "nas" | "s3";
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
}
