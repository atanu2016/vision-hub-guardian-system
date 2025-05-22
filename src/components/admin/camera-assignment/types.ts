
import { Camera as BaseCamera } from '@/types/camera';

export interface Camera extends Pick<BaseCamera, 'id' | 'name' | 'location'> {
  assigned: boolean;
  group: string | null;
  // Add these properties to make it compatible with the base Camera type
  ipaddress?: string;
  status?: 'online' | 'offline' | 'recording';
  lastseen?: string;
}
