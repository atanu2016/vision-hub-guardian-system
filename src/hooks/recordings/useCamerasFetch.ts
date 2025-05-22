
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
          onvifpath: cam.onvifpath
          // Only include fields that exist in the database schema
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
