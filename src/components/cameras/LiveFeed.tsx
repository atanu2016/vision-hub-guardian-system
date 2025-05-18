
import { useState, useCallback, memo } from "react";
import { Camera } from "@/types/camera";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Maximize2, Minimize2, Volume2, VolumeX } from "lucide-react";
import CameraStreamPlayer from "./CameraStreamPlayer";

interface LiveFeedProps {
  camera: Camera;
}

const LiveFeed = memo(({ camera }: LiveFeedProps) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [connectionLost, setConnectionLost] = useState(false);

  // This would be connected to actual stream errors in production
  const handleStreamError = useCallback((error: string) => {
    if (error.includes("unavailable") || error.includes("offline")) {
      setConnectionLost(true);
    }
  }, []);

  const handleReconnect = useCallback(() => {
    setConnectionLost(false);
    // In production, add actual reconnection logic here
  }, []);

  const toggleFullScreen = useCallback(() => {
    setIsFullScreen(prev => !prev);
    // In production, implement actual fullscreen logic
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  if (!camera || !camera.id) {
    return null;
  }

  return (
    <Card className={`overflow-hidden ${isFullScreen ? 'fixed inset-0 z-50' : 'h-full'}`}>
      <div className="relative bg-vision-dark-900">
        {connectionLost ? (
          <div className="aspect-video w-full flex flex-col items-center justify-center bg-vision-dark-900 text-white">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-2" />
            <p className="text-lg font-semibold mb-1">Connection lost</p>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleReconnect} 
              className="mt-2"
            >
              Reconnect
            </Button>
          </div>
        ) : (
          <CameraStreamPlayer 
            camera={camera} 
            autoPlay 
            className="aspect-video"
          />
        )}

        {/* Recording badge */}
        {camera.recording && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            REC
          </div>
        )}
      </div>

      <CardFooter className="flex justify-between items-center p-2">
        <div className="flex flex-col">
          <span className="font-medium line-clamp-1">{camera.name}</span>
          <span className="text-xs text-muted-foreground line-clamp-1">{camera.location}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleMute}>
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleFullScreen}>
            {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
});

LiveFeed.displayName = "LiveFeed";

export default LiveFeed;
