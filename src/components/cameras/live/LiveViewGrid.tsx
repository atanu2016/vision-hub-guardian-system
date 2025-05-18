
import React, { useState, useCallback } from "react";
import { Drawer, DrawerTrigger, DrawerContent } from "@/components/ui/drawer";
import { Camera } from "@/types/camera";
import LiveFeed from "../LiveFeed";
import CameraDrawerContent from "./CameraDrawerContent";

interface LiveViewGridProps {
  cameras: Camera[];
  layout: "grid-2" | "grid-4" | "grid-9";
}

const LiveViewGrid: React.FC<LiveViewGridProps> = ({ cameras, layout }) => {
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  
  const getGridClass = useCallback(() => {
    switch (layout) {
      case "grid-2": return "grid-cols-1 md:grid-cols-2";
      case "grid-4": return "grid-cols-1 md:grid-cols-2 lg:grid-cols-2";
      case "grid-9": return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      default: return "grid-cols-1 md:grid-cols-2";
    }
  }, [layout]);

  const handleCameraSelect = useCallback((camera: Camera) => {
    setSelectedCamera(camera);
  }, []);

  // Early return if no cameras to prevent rendering issues
  if (!cameras || cameras.length === 0) {
    return null;
  }

  return (
    <div className={`grid ${getGridClass()} gap-4`}>
      {cameras.map((camera) => (
        <Drawer key={camera.id}>
          <DrawerTrigger asChild>
            <div 
              onClick={() => handleCameraSelect(camera)}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
            >
              <LiveFeed camera={camera} />
            </div>
          </DrawerTrigger>
          <DrawerContent className="max-h-[90vh]">
            <CameraDrawerContent camera={camera} />
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  );
};

export default LiveViewGrid;
