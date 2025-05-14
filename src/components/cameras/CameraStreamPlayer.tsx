
import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { setupCameraStream } from "@/services/apiService";
import { Camera } from "@/types/camera";
import { Button } from "@/components/ui/button";
import { PlayCircle, PauseCircle, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CameraStreamPlayerProps {
  camera: Camera;
  autoPlay?: boolean;
  className?: string;
}

const CameraStreamPlayer = ({ camera, autoPlay = true, className = "" }: CameraStreamPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    let cleanup: () => void = () => {};
    
    if (camera && camera.status === 'online') {
      setIsLoading(true);
      setError(null);

      const initializeStream = async () => {
        if (!videoRef.current) return;
        
        try {
          const videoElement = videoRef.current;
          const streamUrl = camera.rtmpUrl || '';
          
          // If the URL is an HLS stream and browser supports HLS.js
          if (streamUrl && (streamUrl.includes('.m3u8') || streamUrl.includes('.flv')) && Hls.isSupported()) {
            // Destroy any existing HLS instance
            if (hlsRef.current) {
              hlsRef.current.destroy();
            }
            
            hlsRef.current = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90,
              maxBufferLength: 30,
              maxMaxBufferLength: 60,
              maxBufferSize: 60 * 1000 * 1000, // 60MB max buffer size
              maxBufferHole: 0.5
            });
            
            console.log(`Loading HLS stream: ${streamUrl}`);
            hlsRef.current.loadSource(streamUrl);
            hlsRef.current.attachMedia(videoElement);
            
            hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
              console.log("HLS manifest parsed successfully");
              setIsLoading(false);
              if (isPlaying) {
                videoElement.play().catch(e => {
                  console.warn("Autoplay prevented:", e);
                  setIsPlaying(false);
                });
              }
            });
            
            hlsRef.current.on(Hls.Events.ERROR, (_, data) => {
              console.error("HLS error:", data);
              if (data.fatal) {
                console.error("Fatal HLS error:", data);
                setError("Stream unavailable");
                
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                  toast({
                    title: "Network Error",
                    description: "Unable to load the camera stream due to network issues.",
                    variant: "destructive",
                  });
                }
                
                // Try to recover on fatal errors
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    hlsRef.current?.startLoad();
                    break;
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    hlsRef.current?.recoverMediaError();
                    break;
                  default:
                    // Cannot recover
                    break;
                }
              }
            });
            
            cleanup = () => {
              if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
              }
            };
          } else if (streamUrl) {
            // For direct video sources
            videoElement.src = streamUrl;
            videoElement.onloadeddata = () => {
              console.log("Direct video stream loaded");
              setIsLoading(false);
              if (isPlaying) {
                videoElement.play().catch(e => {
                  console.warn("Autoplay prevented:", e);
                  setIsPlaying(false);
                });
              }
            };
            
            videoElement.onerror = (e) => {
              console.error("Video error:", e);
              setError("Stream unavailable");
              setIsPlaying(false);
            };
            
            cleanup = () => {
              videoElement.src = '';
              videoElement.load();
            };
          } else {
            // For other stream types via API service
            cleanup = setupCameraStream(camera, videoElement, (err) => {
              console.error("Stream setup error via API service:", err);
              setError("Unable to play stream");
              setIsPlaying(false);
            });
            
            videoElement.onloadeddata = () => {
              setIsLoading(false);
            };
            
            videoElement.onerror = () => {
              setError("Stream unavailable");
              setIsPlaying(false);
            };
          }
        } catch (err) {
          console.error("Stream setup error:", err);
          setError("Failed to initialize stream");
          setIsPlaying(false);
        }
      };
      
      initializeStream();
    } else {
      setIsLoading(false);
      setError(camera.status === 'offline' ? "Camera offline" : "Camera unavailable");
    }
    
    return () => {
      cleanup();
    };
  }, [camera, toast, isPlaying]);
  
  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(e => {
        console.warn("Play prevented:", e);
        toast({
          title: "Playback Error",
          description: "Unable to play the video. Please try again.",
          variant: "destructive",
        });
      });
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };
  
  return (
    <div className={`relative aspect-video bg-vision-dark-900 rounded-lg overflow-hidden ${className}`}>
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={camera.thumbnail || '/placeholder.svg'}
        muted={isMuted}
        playsInline
        autoPlay={autoPlay}
      />
      
      {/* Loading overlay */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-vision-dark-900/70">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 border-4 border-t-primary border-vision-dark-500 rounded-full animate-spin mb-2"></div>
            <p className="text-sm">Loading stream...</p>
          </div>
        </div>
      )}
      
      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-vision-dark-900/70">
          <div className="text-center max-w-xs px-4">
            <p className="text-lg font-medium mb-2">{error}</p>
            <p className="text-sm text-muted-foreground">
              The camera stream is currently unavailable. 
              {camera.status === 'offline' ? " The camera is offline." : " Please try again later."}
            </p>
            <Button 
              className="mt-4"
              variant="outline"
              onClick={() => {
                setError(null);
                setIsLoading(true);
                // Force reload the stream
                if (hlsRef.current) {
                  hlsRef.current.destroy();
                  hlsRef.current = null;
                }
                setTimeout(() => {
                  if (videoRef.current) {
                    videoRef.current.load();
                    if (isPlaying) {
                      videoRef.current.play().catch(console.error);
                    }
                  }
                }, 500);
              }}
            >
              Retry Connection
            </Button>
          </div>
        </div>
      )}
      
      {/* Controls overlay - only show when not in error state */}
      {!error && (
        <div className="absolute bottom-2 left-2 right-2 flex justify-between opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <div className="flex gap-1 bg-vision-dark-900/70 backdrop-blur-sm rounded-md p-1">
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0"
              onClick={togglePlay}
              disabled={!!error}
            >
              {isPlaying ? <PauseCircle className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraStreamPlayer;
