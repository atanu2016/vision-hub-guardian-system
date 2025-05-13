
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
  group?: string; // Add group property
}

export type CameraStatus = 'online' | 'offline' | 'error';

export interface CameraGroup {
  id: string;
  name: string;
  cameras: Camera[];
}
