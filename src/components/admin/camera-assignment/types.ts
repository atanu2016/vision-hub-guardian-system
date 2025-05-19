
import { Camera as BaseCamera } from '@/types/camera';

export interface Camera extends Pick<BaseCamera, 'id' | 'name' | 'location' | 'group'> {
  assigned: boolean;
  group: string | null; // Make sure group is included and can be null
}
