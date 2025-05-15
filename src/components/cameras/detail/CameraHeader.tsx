
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import CameraStatusBadges from "./CameraStatusBadges";
import { Camera } from "@/types/camera";

interface CameraHeaderProps {
  camera: Camera;
  onSettingsClick: () => void;
}

const CameraHeader = ({ camera, onSettingsClick }: CameraHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{camera.name}</h1>
        <CameraStatusBadges camera={camera} />
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <Share2 className="mr-2 h-4 w-4" /> Share
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onSettingsClick}
        >
          <Settings className="mr-2 h-4 w-4" /> Configure
        </Button>
      </div>
    </div>
  );
};

export default CameraHeader;
