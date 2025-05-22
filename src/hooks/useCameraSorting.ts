
import { useState, useMemo } from "react";
import { Camera as CameraType } from "@/types/camera";

export interface GroupedCameras {
  id: string;
  name: string;
  cameras: CameraType[];
}

export const useCameraSorting = (cameras: CameraType[]) => {
  const [sortOption, setSortOption] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [groupBy, setGroupBy] = useState<"none" | "group" | "location">("none");

  // Sort cameras based on selected option
  const sortCameras = (camerasToSort: CameraType[]) => {
    return [...camerasToSort].sort((a, b) => {
      let valueA, valueB;
      
      switch (sortOption) {
        case "name":
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case "location":
          valueA = a.location.toLowerCase();
          valueB = b.location.toLowerCase();
          break;
        case "status":
          valueA = a.status;
          valueB = b.status;
          break;
        case "lastSeen":
          valueA = a.lastSeen || "";
          valueB = b.lastSeen || "";
          break;
        default:
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
      }
      
      if (sortOrder === "asc") {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    });
  };

  // Group cameras if groupBy is selected
  const groupCameras = (camerasToGroup: CameraType[]) => {
    if (groupBy === "none") {
      return [{
        id: "all",
        name: "All Cameras",
        cameras: sortCameras(camerasToGroup)
      }];
    }
    
    const grouped = camerasToGroup.reduce((acc, camera) => {
      const key = groupBy === "group" 
        ? (camera.group || "Ungrouped") 
        : camera.location;
        
      if (!acc[key]) {
        acc[key] = [];
      }
      
      acc[key].push(camera);
      return acc;
    }, {} as Record<string, CameraType[]>);
    
    return Object.entries(grouped).map(([name, groupCameras]) => ({
      id: name,
      name,
      cameras: sortCameras(groupCameras)
    }));
  };

  // Get camera list based on tab and apply sorting/grouping
  const getCameraList = (tabValue: string) => {
    let cameraList;
    
    const onlineCameras = cameras.filter(camera => camera.status === "online");
    const offlineCameras = cameras.filter(camera => camera.status === "offline");
    const recordingCameras = cameras.filter(camera => camera.recording);
    
    switch (tabValue) {
      case "all":
        cameraList = cameras;
        break;
      case "online":
        cameraList = onlineCameras;
        break;
      case "offline":
        cameraList = offlineCameras;
        break;
      case "recording":
        cameraList = recordingCameras;
        break;
      default:
        cameraList = cameras;
    }
    
    return groupCameras(cameraList);
  };

  return {
    sortOption,
    setSortOption,
    sortOrder,
    setSortOrder,
    groupBy,
    setGroupBy,
    getCameraList,
    onlineCamerasCount: useMemo(() => cameras.filter(c => c.status === "online").length, [cameras]),
    offlineCamerasCount: useMemo(() => cameras.filter(c => c.status === "offline").length, [cameras]),
    recordingCamerasCount: useMemo(() => cameras.filter(c => c.recording).length, [cameras])
  };
};
