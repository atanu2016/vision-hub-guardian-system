
export interface Camera {
  id: string;
  name: string;
  location: string;
  ipAddress: string;
  port?: number;
  username?: string;
  password?: string;
  status: "online" | "offline";
  model?: string;
  manufacturer?: string;
  lastSeen: string;
  recording: boolean;
  rtmpUrl?: string;
  thumbnail?: string;
  group?: string;
  connectionType?: "rtmp" | "rtsp" | "ip" | "onvif";
  motionDetection?: boolean;
}

export interface CameraGroup {
  id: string;
  name: string;
  cameras: Camera[];
}

export interface StorageSettings {
  type: 'local' | 'nas' | 'cloud';
  path?: string;
  nasAddress?: string;
  nasPath?: string;
  nasUsername?: string;
  nasPassword?: string;
  cloudProvider?: 'aws' | 'azure' | 'gcp';
  cloudRegion?: string;
  cloudBucket?: string;
  cloudKey?: string;
  cloudSecret?: string;
  retentionDays: number;
  overwriteOldest: boolean;
}
