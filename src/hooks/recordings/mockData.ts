
import { Recording } from "./types";

// Mock recordings data for development
export const mockRecordings: Recording[] = [
  {
    id: "rec1",
    cameraName: "Front Entrance",
    date: "2025-05-17",
    time: "08:00:00",
    duration: 165,
    fileSize: "290 MB",
    type: "Scheduled",
    important: true,
    thumbnailUrl: "/placeholder.svg"
  },
  {
    id: "rec2",
    cameraName: "Front Entrance",
    date: "2025-05-17",
    time: "14:00:00",
    duration: 105,
    fileSize: "128 MB",
    type: "Motion",
    important: false,
    thumbnailUrl: "/placeholder.svg"
  },
  {
    id: "rec3",
    cameraName: "Front Entrance",
    date: "2025-05-17",
    time: "11:00:00",
    duration: 15,
    fileSize: "40 MB",
    type: "Motion",
    important: false,
    thumbnailUrl: "/placeholder.svg"
  },
  {
    id: "rec4",
    cameraName: "Front Entrance",
    date: "2025-05-17",
    time: "18:00:00",
    duration: 45,
    fileSize: "103 MB",
    type: "Motion",
    important: true,
    thumbnailUrl: "/placeholder.svg"
  },
  {
    id: "rec5",
    cameraName: "Parking Lot",
    date: "2025-05-17",
    time: "14:00:00",
    duration: 90,
    fileSize: "151 MB",
    type: "Scheduled",
    important: false,
    thumbnailUrl: "/placeholder.svg"
  },
  {
    id: "rec6",
    cameraName: "Parking Lot",
    date: "2025-05-17",
    time: "16:00:00",
    duration: 120,
    fileSize: "280 MB",
    type: "Manual",
    important: true,
    thumbnailUrl: "/placeholder.svg"
  },
  {
    id: "rec7",
    cameraName: "Parking Lot",
    date: "2025-05-17", 
    time: "08:00:00",
    duration: 105,
    fileSize: "283 MB",
    type: "Scheduled",
    important: false,
    thumbnailUrl: "/placeholder.svg"
  }
];
