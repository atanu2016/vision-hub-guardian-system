
import React from "react";
import { Drawer, DrawerTrigger, DrawerContent } from "@/components/ui/drawer";
import { Camera } from "@/types/camera";
import LiveFeed from "../LiveFeed";
import CameraDrawerContent from "./CameraDrawerContent";

interface LiveViewGridProps {
  cameras: Camera[];
  layout: "grid-2" | "grid-4" | "grid-9";
}

const LiveViewGrid: React.FC<LiveViewGridProps> = ({ cameras, layout }) => {
  const [selectedCamera, setSelectedCamera] = React.useState<Camera | null>(null);
  
  const getGridClass = () => {
    switch (layout) {
      case "grid-2": return "grid-cols-1 md:grid-cols-2";
      case "grid-4": return "grid-cols-1 md:grid-cols-2 lg:grid-cols-2";
      case "grid-9": return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      default: return "grid-cols-1 md:grid-cols-2";
    }
  };

  const handleCameraSelect = (camera: Camera) => {
    setSelectedCamera(camera);
  };

  return (
    <div className={`grid ${getGridClass()} gap-4`}>
      {cameras.map(camera => (
        <Drawer key={camera.id}>
          <DrawerTrigger asChild>
            <div onClick={() => handleCameraSelect(camera)}>
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
