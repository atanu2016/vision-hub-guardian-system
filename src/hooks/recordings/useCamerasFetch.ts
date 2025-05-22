
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Camera, CameraStatus } from "@/types/camera";
import { toast } from "sonner";

export const useCamerasFetch = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    try {
      const { data, error } = await supabase
        .from('cameras')
        .select('*');

      if (error) {
        throw error;
      }

      if (data) {
        const camerasFormatted: Camera[] = data.map(cam => ({
          id: cam.id,
          name: cam.name,
          status: (cam.status as CameraStatus) || 'offline',
          location: cam.location || 'Unknown',
          ipaddress: cam.ipaddress || '',
          lastseen: cam.lastseen || new Date().toISOString(),
          recording: cam.recording === true,
          port: cam.port,
          username: cam.username,
          password: cam.password,
          model: cam.model,
          manufacturer: cam.manufacturer,
          connectiontype: cam.connectiontype,
          thumbnail: cam.thumbnail,
          group: cam.group,
          motiondetection: cam.motiondetection,
          rtmpurl: cam.rtmpurl,
          hlsurl: cam.hlsurl,
          onvifpath: cam.onvifpath,
          // Handle optional properties with defaults
          quality: cam.quality || 'medium',
          schedule_type: cam.schedule_type || 'always',
          time_start: cam.time_start || '00:00',
          time_end: cam.time_end || '23:59',
          days_of_week: cam.days_of_week || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        }));
        setCameras(camerasFormatted);
      }
    } catch (error) {
      console.error("Failed to fetch cameras:", error);
      toast.error("Failed to fetch cameras");
    } finally {
      setLoading(false);
    }
  };

  return { cameras, loading, fetchCameras };
};
