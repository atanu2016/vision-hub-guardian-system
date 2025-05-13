
export interface Camera {
  id: string;
  name: string;
  location: string;
  ipAddress: string;
  port: number;
  username: string;
  status: CameraStatus;
  model?: string;
  manufacturer?: string;
  lastSeen?: string;
  recording?: boolean;
  thumbnail?: string;
  group?: string;
  connectionType: CameraConnectionType;
  password?: string;
  rtmpUrl?: string;
  onvifPath?: string;
}

export type CameraStatus = 'online' | 'offline' | 'error';
export type CameraConnectionType = 'ip' | 'onvif' | 'rtmp';

export interface CameraGroup {
  id: string;
  name: string;
  cameras: Camera[];
}

export interface StorageSettings {
  type: 'local' | 'nas' | 'cloud';
  path?: string;
  nasAddress?: string;
  nasUsername?: string;
  nasPassword?: string;
  cloudProvider?: string;
  cloudKey?: string;
  cloudSecret?: string;
  cloudBucket?: string;
  cloudRegion?: string;
}
