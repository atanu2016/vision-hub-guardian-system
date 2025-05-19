
import { Camera as BaseCamera } from '@/types/camera';

export interface Camera extends Partial<BaseCamera> {
  id: string;
  name: string;
  location: string;
  assigned: boolean;
}
