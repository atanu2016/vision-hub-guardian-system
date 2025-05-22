
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Camera } from "./types";
import { toast } from "sonner";
import { CameraStatus } from "@/types/camera";

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
          ipAddress: cam.ipaddress || '', 
          ipaddress: cam.ipaddress || '', // Include both for compatibility
          lastSeen: cam.lastseen || new Date().toISOString(),
          lastseen: cam.lastseen || new Date().toISOString(), // Include both for compatibility
          recording: cam.recording === true
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
