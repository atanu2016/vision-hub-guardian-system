
import { Camera, CameraGroup } from "@/types/camera";

export const mockCameras: Camera[] = [
  {
    id: "cam-1",
    name: "Front Door",
    location: "Main Entrance",
    ipAddress: "192.168.1.100",
    port: 8080,
    username: "admin",
    status: "online",
    model: "Hikvision DS-2CD2385G1-I",
    manufacturer: "Hikvision",
    lastSeen: new Date().toISOString(),
    recording: true,
    thumbnail: "/placeholder.svg"
  },
  {
    id: "cam-2",
    name: "Back Yard",
    location: "Pool Area",
    ipAddress: "192.168.1.101",
    port: 8080,
    username: "admin",
    status: "online",
    model: "Reolink RLC-810A",
    manufacturer: "Reolink",
    lastSeen: new Date().toISOString(),
    recording: false,
    thumbnail: "/placeholder.svg"
  },
  {
    id: "cam-3",
    name: "Garage",
    location: "Garage Entrance",
    ipAddress: "192.168.1.102",
    port: 8080,
    username: "admin",
    status: "offline",
    model: "Amcrest IP2M-841",
    manufacturer: "Amcrest",
    lastSeen: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "cam-4",
    name: "Side Gate",
    location: "East Fence",
    ipAddress: "192.168.1.103",
    port: 8080,
    username: "admin",
    status: "online",
    model: "Reolink RLC-511W",
    manufacturer: "Reolink",
    lastSeen: new Date().toISOString(),
    recording: false,
    thumbnail: "/placeholder.svg"
  },
  {
    id: "cam-5",
    name: "Living Room",
    location: "Main Floor",
    ipAddress: "192.168.1.104",
    port: 8080,
    username: "admin",
    status: "online",
    model: "Wyze Cam v3",
    manufacturer: "Wyze",
    lastSeen: new Date().toISOString(),
    recording: false,
    thumbnail: "/placeholder.svg"
  },
  {
    id: "cam-6",
    name: "Kitchen",
    location: "Main Floor",
    ipAddress: "192.168.1.105",
    port: 8080,
    username: "admin",
    status: "offline",
    model: "Wyze Cam v3",
    manufacturer: "Wyze",
    lastSeen: new Date(Date.now() - 7200000).toISOString()
  }
];

export const mockCameraGroups: CameraGroup[] = [
  {
    id: "group-1",
    name: "Outdoor",
    cameras: mockCameras.filter(camera => 
      ["Front Door", "Back Yard", "Side Gate"].includes(camera.name)
    )
  },
  {
    id: "group-2",
    name: "Indoor",
    cameras: mockCameras.filter(camera => 
      ["Living Room", "Kitchen", "Garage"].includes(camera.name)
    )
  }
];

export const getSystemStats = () => {
  const totalCameras = mockCameras.length;
  const onlineCameras = mockCameras.filter(cam => cam.status === "online").length;
  const recordingCameras = mockCameras.filter(cam => cam.recording).length;
  const offlineCameras = totalCameras - onlineCameras;
  
  return {
    totalCameras,
    onlineCameras,
    offlineCameras,
    recordingCameras,
    storageUsed: "128.5 GB",
    storageTotal: "1 TB",
    storagePercentage: 12.85,
    uptimeHours: 72,
  };
};
