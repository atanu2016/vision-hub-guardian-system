
import { Camera } from "@/types/camera";

/**
 * Maps camera properties to the expected case format
 * This utility helps bridge the gap between the backend schema (lowercase properties)
 * and frontend components expecting camelCase properties
 */

export type CameraUIProps = {
  id: string;
  name: string;
  ipAddress: string;
  port?: number;
  username?: string;
  password?: string;
  location: string;
  status: 'online' | 'offline' | 'recording';
  lastSeen: string;
  recording?: boolean;
  motionDetection?: boolean;
  rtmpUrl?: string;
  hlsUrl?: string;
  onvifPath?: string;
  connectionType?: string;
  group?: string;
  thumbnail?: string;
  manufacturer?: string;
  model?: string;
  quality?: string;
  scheduleType?: string;
  timeStart?: string;
  timeEnd?: string;
  daysOfWeek?: string[];
};

/**
 * Converts database camera model to UI friendly format
 */
export const toUICamera = (dbCamera: Camera): CameraUIProps => {
  return {
    id: dbCamera.id,
    name: dbCamera.name,
    ipAddress: dbCamera.ipaddress,
    port: dbCamera.port,
    username: dbCamera.username,
    password: dbCamera.password,
    location: dbCamera.location,
    status: dbCamera.status,
    lastSeen: dbCamera.lastseen,
    recording: dbCamera.recording,
    motionDetection: dbCamera.motiondetection,
    rtmpUrl: dbCamera.rtmpurl,
    hlsUrl: dbCamera.hlsurl,
    onvifPath: dbCamera.onvifpath,
    connectionType: dbCamera.connectiontype,
    group: dbCamera.group,
    thumbnail: dbCamera.thumbnail,
    manufacturer: dbCamera.manufacturer,
    model: dbCamera.model,
    quality: dbCamera.quality,
    scheduleType: dbCamera.scheduleType,
    timeStart: dbCamera.timeStart,
    timeEnd: dbCamera.timeEnd,
    daysOfWeek: dbCamera.daysOfWeek
  };
};

/**
 * Converts UI camera model back to database format
 */
export const toDatabaseCamera = (uiCamera: CameraUIProps): Camera => {
  return {
    id: uiCamera.id,
    name: uiCamera.name,
    ipaddress: uiCamera.ipAddress,
    port: uiCamera.port,
    username: uiCamera.username,
    password: uiCamera.password,
    location: uiCamera.location,
    status: uiCamera.status as "online" | "offline" | "recording",
    lastseen: uiCamera.lastSeen,
    recording: uiCamera.recording,
    motiondetection: uiCamera.motionDetection,
    rtmpurl: uiCamera.rtmpUrl,
    hlsurl: uiCamera.hlsUrl,
    onvifpath: uiCamera.onvifPath,
    connectiontype: uiCamera.connectionType,
    group: uiCamera.group,
    thumbnail: uiCamera.thumbnail,
    manufacturer: uiCamera.manufacturer,
    model: uiCamera.model,
    quality: uiCamera.quality,
    scheduleType: uiCamera.scheduleType,
    timeStart: uiCamera.timeStart,
    timeEnd: uiCamera.timeEnd,
    daysOfWeek: uiCamera.daysOfWeek
  };
};
