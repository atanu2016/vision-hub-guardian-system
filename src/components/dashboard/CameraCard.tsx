
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Info } from "lucide-react";
import { Camera } from "@/types/camera";
import { Link } from "react-router-dom";

interface CameraCardProps {
  camera: Camera;
}

const CameraCard: React.FC<CameraCardProps> = ({ camera }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500";
      case "recording": return "bg-red-500";
      case "offline":
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "online": return "Online";
      case "recording": return "Recording";
      case "offline":
      default: return "Offline";
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <AspectRatio ratio={16/9}>
          <img 
            src={camera.thumbnail || "/placeholder.svg"} 
            alt={`Camera: ${camera.name}`}
            className="w-full h-full object-cover"
          />
        </AspectRatio>
        <div className="absolute bottom-2 left-2">
          <Badge className={getStatusColor(camera.status)}>
            {getStatusText(camera.status)}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <div>
            <h3 className="font-medium">{camera.name}</h3>
            <div className="text-sm text-muted-foreground">
              {camera.location || "Unknown location"}
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button asChild size="sm" variant="outline" className="flex-1 gap-1">
              <Link to={`/cameras/${camera.id}`}>
                <Info className="h-3.5 w-3.5" /> Details
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="flex-1 gap-1">
              <Link to={`/live?camera=${camera.id}`}>
                <ExternalLink className="h-3.5 w-3.5" /> View Live
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CameraCard;
