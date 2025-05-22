
import React from "react";
import { Camera } from "@/types/camera";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Info, WifiOff } from "lucide-react";

interface CameraDetailsProps {
  camera: Camera;
  isStreaming?: boolean;
}

const CameraDetails: React.FC<CameraDetailsProps> = ({ camera, isStreaming = false }) => {
  // A camera is truly online only if both its status is "online" AND the stream is available
  const isTrulyOnline = camera.status === "online" && isStreaming;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          Camera Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-medium">
              {isTrulyOnline ? (
                <span className="text-green-500">Online</span>
              ) : (
                <span className="text-red-500 flex items-center gap-1">
                  <WifiOff size={12} /> {camera.status === "online" ? "Stream Unavailable" : "Offline"}
                </span>
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Location</p>
            <p className="font-medium">{camera.location || "Not specified"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">IP Address</p>
            <p className="font-medium">{camera.ipAddress}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Model</p>
            <p className="font-medium">{camera.model || "Unknown"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Connection Type</p>
            <p className="font-medium">{camera.connectionType?.toUpperCase() || "IP"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last Seen</p>
            <p className="font-medium">
              {new Date(camera.lastSeen).toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CameraDetails;
