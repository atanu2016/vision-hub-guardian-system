
import { Camera } from "@/types/camera";

// The UI format of camera properties (camelCase)
export interface CameraUIProps {
  id: string;
  name: string;
  status: "online" | "offline" | "recording";
  location: string;
  ipAddress: string;
  port: number;
  username?: string;
  password?: string;
  model?: string;
  manufacturer?: string;
  lastSeen: string;
  recording: boolean;
  group?: string;
  connectionType: "ip" | "rtsp" | "rtmp" | "hls" | "onvif";
  rtmpUrl?: string;
  hlsUrl?: string;
  onvifPath?: string;
  motionDetection?: boolean;
  thumbnail?: string;
  // Add the missing properties from the Camera type
  quality?: string;
  scheduleType?: string;
  timeStart?: string;
  timeEnd?: string;
  daysOfWeek?: string[];
}

// Convert from UI format (camelCase) to database format (snake_case-like)
export function toDatabaseCamera(uiCamera: CameraUIProps): Camera {
  return {
    id: uiCamera.id,
    name: uiCamera.name,
    status: uiCamera.status,
    location: uiCamera.location,
    ipaddress: uiCamera.ipAddress,
    port: uiCamera.port,
    username: uiCamera.username,
    password: uiCamera.password,
    model: uiCamera.model,
    manufacturer: uiCamera.manufacturer,
    lastseen: uiCamera.lastSeen,
    recording: uiCamera.recording,
    group: uiCamera.group,
    connectiontype: uiCamera.connectionType,
    rtmpurl: uiCamera.rtmpUrl,
    hlsurl: uiCamera.hlsUrl,
    onvifpath: uiCamera.onvifPath,
    motiondetection: uiCamera.motionDetection,
    thumbnail: uiCamera.thumbnail,
    // Map the additional properties
    quality: uiCamera.quality,
    scheduleType: uiCamera.scheduleType,
    timeStart: uiCamera.timeStart,
    timeEnd: uiCamera.timeEnd,
    daysOfWeek: uiCamera.daysOfWeek
  };
}

// Convert from database format to UI format
export function toUICamera(dbCamera: Camera): CameraUIProps {
  return {
    id: dbCamera.id,
    name: dbCamera.name,
    status: dbCamera.status,
    location: dbCamera.location,
    ipAddress: dbCamera.ipaddress,
    port: dbCamera.port || 80,
    username: dbCamera.username,
    password: dbCamera.password,
    model: dbCamera.model,
    manufacturer: dbCamera.manufacturer,
    lastSeen: dbCamera.lastseen,
    recording: dbCamera.recording || false,
    group: dbCamera.group,
    connectionType: (dbCamera.connectiontype as "ip" | "rtsp" | "rtmp" | "hls" | "onvif") || "ip",
    rtmpUrl: dbCamera.rtmpurl,
    hlsUrl: dbCamera.hlsurl,
    onvifPath: dbCamera.onvifpath,
    motionDetection: dbCamera.motiondetection,
    thumbnail: dbCamera.thumbnail,
    // Map additional properties
    quality: dbCamera.quality,
    scheduleType: dbCamera.scheduleType,
    timeStart: dbCamera.timeStart,
    timeEnd: dbCamera.timeEnd,
    daysOfWeek: dbCamera.daysOfWeek
  };
}

// Convert to UI format with a default value for the camera
export function toUICameraWithDefault(dbCamera: Partial<Camera> & { id: string }): CameraUIProps {
  return {
    id: dbCamera.id,
    name: dbCamera.name || "Unknown Camera",
    status: (dbCamera.status as "online" | "offline" | "recording") || "offline",
    location: dbCamera.location || "Unknown",
    ipAddress: dbCamera.ipaddress || "",
    port: dbCamera.port || 80,
    username: dbCamera.username,
    password: dbCamera.password,
    model: dbCamera.model,
    manufacturer: dbCamera.manufacturer,
    lastSeen: dbCamera.lastseen || new Date().toISOString(),
    recording: dbCamera.recording || false,
    group: dbCamera.group || "Ungrouped",
    connectionType: (dbCamera.connectiontype as "ip" | "rtsp" | "rtmp" | "hls" | "onvif") || "ip",
    rtmpUrl: dbCamera.rtmpurl,
    hlsUrl: dbCamera.hlsurl,
    onvifPath: dbCamera.onvifpath,
    motionDetection: dbCamera.motiondetection || false,
    thumbnail: dbCamera.thumbnail,
    // Map additional properties with defaults
    quality: dbCamera.quality || "medium",
    scheduleType: dbCamera.scheduleType || "always",
    timeStart: dbCamera.timeStart || "00:00",
    timeEnd: dbCamera.timeEnd || "23:59",
    daysOfWeek: dbCamera.daysOfWeek || []
  };
}

// Add a function to adapt between different camera object formats with appropriate type handling
export function adaptCamera<T extends Partial<Camera>, U extends Partial<CameraUIProps>>(
  camera: T, 
  isUiToDb = false
): U {
  if (isUiToDb) {
    // UI format to DB format
    return {
      ...(camera as any),
      ipaddress: (camera as any).ipAddress,
      lastseen: (camera as any).lastSeen,
      connectiontype: (camera as any).connectionType,
      rtmpurl: (camera as any).rtmpUrl,
      hlsurl: (camera as any).hlsUrl,
      onvifpath: (camera as any).onvifPath,
      motiondetection: (camera as any).motionDetection
    } as U;
  } else {
    // DB format to UI format
    return {
      ...(camera as any),
      ipAddress: (camera as any).ipaddress,
      lastSeen: (camera as any).lastseen,
      connectionType: (camera as any).connectiontype,
      rtmpUrl: (camera as any).rtmpurl,
      hlsUrl: (camera as any).hlsurl,
      onvifPath: (camera as any).onvifpath,
      motionDetection: (camera as any).motiondetection
    } as U;
  }
}
