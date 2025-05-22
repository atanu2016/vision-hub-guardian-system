
import { Camera, CameraStatus } from "@/types/camera";
import { CameraUIProps } from "@/utils/cameraPropertyMapper";

// Helper hook to adapt between Camera and CameraUIProps types
export const useCameraAdapter = () => {
  // Convert Camera (DB format) to CameraUIProps (UI format)
  const toCameraUIProps = (camera: Camera): CameraUIProps => {
    return {
      id: camera.id,
      name: camera.name,
      status: camera.status,
      location: camera.location,
      ipAddress: camera.ipaddress,
      port: camera.port || 80,
      username: camera.username,
      password: camera.password,
      model: camera.model,
      manufacturer: camera.manufacturer,
      lastSeen: camera.lastseen,
      recording: camera.recording || false,
      group: camera.group,
      connectionType: (camera.connectiontype as "ip" | "rtsp" | "rtmp" | "hls" | "onvif") || "ip",
      rtmpUrl: camera.rtmpurl,
      hlsUrl: camera.hlsurl,
      onvifPath: camera.onvifpath,
      motionDetection: camera.motiondetection,
      thumbnail: camera.thumbnail
    };
  };

  // Convert CameraUIProps (UI format) to Camera (DB format)
  const toCamera = (cameraUI: CameraUIProps): Camera => {
    return {
      id: cameraUI.id,
      name: cameraUI.name,
      status: cameraUI.status as CameraStatus,
      location: cameraUI.location,
      ipaddress: cameraUI.ipAddress,
      port: cameraUI.port,
      username: cameraUI.username,
      password: cameraUI.password,
      model: cameraUI.model,
      manufacturer: cameraUI.manufacturer,
      lastseen: cameraUI.lastSeen,
      recording: cameraUI.recording,
      group: cameraUI.group,
      connectiontype: cameraUI.connectionType,
      rtmpurl: cameraUI.rtmpUrl,
      hlsurl: cameraUI.hlsUrl,
      onvifpath: cameraUI.onvifPath,
      motiondetection: cameraUI.motionDetection,
      thumbnail: cameraUI.thumbnail
    };
  };

  // Helper to adapt camera parameters for the addCamera function
  const adaptCameraParams = (cameraUIParams: Omit<CameraUIProps, "id" | "lastSeen">): Omit<Camera, "id"> & { lastseen: string } => {
    return {
      name: cameraUIParams.name,
      status: cameraUIParams.status as CameraStatus,
      location: cameraUIParams.location,
      ipaddress: cameraUIParams.ipAddress,
      port: cameraUIParams.port,
      username: cameraUIParams.username,
      password: cameraUIParams.password,
      model: cameraUIParams.model,
      manufacturer: cameraUIParams.manufacturer,
      lastseen: new Date().toISOString(),
      recording: cameraUIParams.recording,
      group: cameraUIParams.group,
      connectiontype: cameraUIParams.connectionType,
      rtmpurl: cameraUIParams.rtmpUrl || '',
      hlsurl: cameraUIParams.hlsUrl || '',
      onvifpath: cameraUIParams.onvifPath || '',
      motiondetection: cameraUIParams.motionDetection,
      thumbnail: cameraUIParams.thumbnail
    };
  };

  return {
    toCameraUIProps,
    toCamera,
    adaptCameraParams
  };
};
