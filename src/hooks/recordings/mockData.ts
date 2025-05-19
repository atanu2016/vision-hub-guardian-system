
import { Recording } from "./types";

export const mockRecordings: Recording[] = [
  {
    id: "1",
    cameraName: "Front Door",
    date: "2025-05-19", 
    time: "08:30:00",
    duration: 15,
    fileSize: "45 MB",
    type: "Motion",
    important: true,
    thumbnailUrl: "/placeholder.svg"
  },
  {
    id: "2",
    cameraName: "Backyard",
    date: "2025-05-19",
    time: "10:15:00",
    duration: 30,
    fileSize: "90 MB",
    type: "Scheduled",
    important: false,
    thumbnailUrl: "/placeholder.svg"
  },
  {
    id: "3",
    cameraName: "Living Room",
    date: "2025-05-18",
    time: "14:45:00",
    duration: 10,
    fileSize: "30 MB",
    type: "Manual",
    important: false,
    thumbnailUrl: "/placeholder.svg"
  },
  {
    id: "4",
    cameraName: "Garage",
    date: "2025-05-18",
    time: "20:00:00",
    duration: 25,
    fileSize: "75 MB",
    type: "Motion",
    important: true,
    thumbnailUrl: "/placeholder.svg"
  }
];
