
import { Camera } from "@/types/camera";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";

interface CameraDetailsCardProps {
  camera: Camera;
}

const CameraDetailsCard = ({ camera }: CameraDetailsCardProps) => {
  const [isStreaming, setIsStreaming] = useState(false);
  
  useEffect(() => {
    // Only check streaming status if the camera is marked as online
    if (camera.status === "online") {
      const checkStreamAvailability = async () => {
        try {
          // In a real implementation, this would be an actual API call
          // For demo purposes, we're checking if stream URL exists and simulating success/failure
          const hasStreamUrl = Boolean(camera.rtmpUrl?.length > 0 || camera.hlsUrl?.length > 0);
          
          if (hasStreamUrl) {
            // Simulate a 70% chance of stream being available
            await new Promise(resolve => setTimeout(resolve, 500));
            setIsStreaming(Math.random() > 0.3);
          } else {
            setIsStreaming(false);
          }
        } catch (error) {
          console.error("Failed to check streaming status:", error);
          setIsStreaming(false);
        }
      };
      
      checkStreamAvailability();
    } else {
      setIsStreaming(false);
    }
  }, [camera.status, camera.rtmpUrl, camera.hlsUrl]);
  
  // A camera is truly online only if both its status is "online" AND the stream is available
  const isTrulyOnline = camera.status === "online" && isStreaming;
  
  return (
    <div className="border rounded-md p-4">
      <h2 className="text-lg font-medium mb-4">Camera Details</h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Location</p>
          <p>{camera.location}</p>
        </div>
        <Separator />
        <div>
          <p className="text-sm text-muted-foreground">Model</p>
          <p>{camera.model || "Not specified"}</p>
        </div>
        <Separator />
        <div>
          <p className="text-sm text-muted-foreground">Manufacturer</p>
          <p>{camera.manufacturer || "Not specified"}</p>
        </div>
        <Separator />
        <div>
          <p className="text-sm text-muted-foreground">IP Address</p>
          <p>{camera.ipAddress}:{camera.port}</p>
        </div>
        <Separator />
        <div>
          <p className="text-sm text-muted-foreground">Connection Type</p>
          <p>{camera.connectionType?.toUpperCase() || "IP"}</p>
        </div>
        <Separator />
        <div>
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isTrulyOnline ? "bg-green-500" : "bg-red-500"}`}></span>
            {isTrulyOnline ? "Online" : camera.status === "online" ? "Stream Unavailable" : "Offline"}
          </p>
        </div>
        {camera.status === "online" && !isStreaming && (
          <>
            <Separator />
            <div className="text-amber-500 text-sm">
              <p>Camera is online but stream is not available.</p>
              <p>Please check camera streaming settings.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CameraDetailsCard;
