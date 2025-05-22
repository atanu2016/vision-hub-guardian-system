
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Download, Play } from "lucide-react";
import { Recording } from "@/hooks/recordings/types";
import { formatDistanceToNow } from 'date-fns';

interface RecordingCardProps {
  recording: Recording;
}

const RecordingCard: React.FC<RecordingCardProps> = ({ recording }) => {
  const getBadgeColor = (type: string) => {
    switch (type) {
      case "Scheduled": return "bg-blue-500";
      case "Motion": return "bg-amber-500";
      case "Manual": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <AspectRatio ratio={16/9}>
          <img 
            src={recording.thumbnailUrl || "/placeholder.svg"} 
            alt={`Recording from ${recording.cameraName}`}
            className="w-full h-full object-cover"
          />
        </AspectRatio>
        <div className="absolute bottom-2 left-2 flex gap-1">
          <Badge className={getBadgeColor(recording.type)}>
            {recording.type}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{recording.cameraName}</h3>
              <div className="text-sm text-muted-foreground">
                {recording.date} • {recording.time}
              </div>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              <span>{recording.duration}s</span>
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" className="w-full flex-1 gap-1">
              <Play className="h-3.5 w-3.5" /> Play
            </Button>
            <Button size="sm" variant="outline" className="w-full flex-1 gap-1">
              <Download className="h-3.5 w-3.5" /> Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecordingCard;
