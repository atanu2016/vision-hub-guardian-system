
import React from "react";
import { DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Camera } from "@/types/camera";
import LiveFeed from "../LiveFeed";
import CameraDetails from "./CameraDetails";

interface CameraDrawerContentProps {
  camera: Camera;
}

const CameraDrawerContent: React.FC<CameraDrawerContentProps> = ({ camera }) => {
  return (
    <>
      <DrawerHeader>
        <DrawerTitle className="flex items-center">
          <span className="mr-2">{camera.name}</span>
          {camera.recording && (
            <span className="bg-red-600 text-white px-2 py-0.5 text-xs rounded-md flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
              REC
            </span>
          )}
        </DrawerTitle>
      </DrawerHeader>
      <div className="p-4 space-y-6">
        <div className="aspect-video w-full overflow-hidden rounded-lg">
          <LiveFeed camera={camera} />
        </div>
        <CameraDetails camera={camera} />
      </div>
    </>
  );
};

export default CameraDrawerContent;
