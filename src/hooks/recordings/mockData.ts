
import { Recording } from "./types";

export const mockRecordings: Recording[] = [
  {
    id: "1",
    cameraName: "Front Door",
    date: "2025-05-19", 
    time: "08:30:00",
    duration: 15, // Changed to number
    fileSize: "45 MB",
    type: "Motion",
    important: true,
    thumbnailUrl: "/placeholder.svg",
    dateTime: "2025-05-19T08:30:00" // Added dateTime field
  },
  {
    id: "2",
    cameraName: "Backyard",
    date: "2025-05-19",
    time: "10:15:00",
    duration: 30, // Changed to number
    fileSize: "90 MB",
    type: "Scheduled",
    important: false,
    thumbnailUrl: "/placeholder.svg",
    dateTime: "2025-05-19T10:15:00" // Added dateTime field
  },
  {
    id: "3",
    cameraName: "Living Room",
    date: "2025-05-18",
    time: "14:45:00",
    duration: 10, // Changed to number
    fileSize: "30 MB",
    type: "Manual",
    important: false,
    thumbnailUrl: "/placeholder.svg",
    dateTime: "2025-05-18T14:45:00" // Added dateTime field
  },
  {
    id: "4",
    cameraName: "Garage",
    date: "2025-05-18",
    time: "20:00:00",
    duration: 25, // Changed to number
    fileSize: "75 MB",
    type: "Motion",
    important: true,
    thumbnailUrl: "/placeholder.svg",
    dateTime: "2025-05-18T20:00:00" // Added dateTime field
  }
];
