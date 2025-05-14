
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, PauseCircle, PlayCircle, Settings, Share2 } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import AppLayout from "@/components/layout/AppLayout";
import { useState, useEffect, useRef } from "react";
import { getCameras } from "@/data/mockData";
import { setupCameraStream } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
import { Camera } from "@/types/camera";

const CameraDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [isStreaming, setIsStreaming] = useState(true);
  const [camera, setCamera] = useState<Camera | null>(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchCamera = async () => {
      setLoading(true);
      try {
        const cameras = await getCameras();
        const foundCamera = cameras.find(cam => cam.id === id);
        if (foundCamera) {
          setCamera(foundCamera);
        } else {
          toast({
            title: "Camera not found",
            description: "The requested camera could not be found.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching camera:", error);
        toast({
          title: "Error loading camera",
          description: "Could not load camera details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCamera();
  }, [id, toast]);
  
  // Setup camera stream when camera data is loaded
  useEffect(() => {
    if (!camera || !camera.status || camera.status !== "online") return;
    
    const cleanupFn = setupCameraStream(
      camera, 
      videoRef.current,
      (error) => {
        console.error("Error setting up camera stream:", error);
        toast({
          title: "Stream Error",
          description: "Could not connect to camera stream. Please check camera settings.",
          variant: "destructive",
        });
      }
    );
    
    return () => {
      cleanupFn();
    };
  }, [camera, toast]);
  
  const handleToggleStreaming = () => {
    setIsStreaming(!isStreaming);
    
    if (videoRef.current) {
      if (!isStreaming) {
        // Resume streaming
        if (camera) {
          setupCameraStream(camera, videoRef.current);
        }
      } else {
        // Pause streaming
        videoRef.current.pause();
      }
    }
  };
  
  const handleTakeSnapshot = () => {
    // Implementation would capture a frame from the video
    toast({
      title: "Snapshot taken",
      description: "Screenshot saved to recordings folder.",
    });
  };
  
  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[70vh]">
          <p>Loading camera details...</p>
        </div>
      </AppLayout>
    );
  }
  
  if (!camera) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">Camera Not Found</h1>
            </div>
          </div>
          <p>The requested camera could not be found. It may have been deleted or you may not have permission to view it.</p>
          <Button asChild>
            <Link to="/">Return to Dashboard</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }
  
  const isOnline = camera.status === "online";
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">{camera.name}</h1>
            <Badge variant={isOnline ? "default" : "outline"} className="ml-2">
              {isOnline ? "Online" : "Offline"}
            </Badge>
            {camera.recording && (
              <Badge variant="outline" className="bg-vision-dark-700 text-red-500">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  Recording
                </span>
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/cameras/${id}/settings`}>
                <Settings className="mr-2 h-4 w-4" /> Configure
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative aspect-video rounded-lg overflow-hidden border border-border bg-vision-dark-900">
              {isOnline ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <video 
                    ref={videoRef}
                    className="h-full w-full object-contain"
                    poster={camera.thumbnail || '/placeholder.svg'}
                    playsInline
                    autoPlay={isStreaming}
                    muted
                  />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-lg">Camera offline</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Last seen: {new Date(camera.lastSeen || "").toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant={isStreaming ? "default" : "outline"}
                    className="flex-shrink-0"
                    onClick={handleToggleStreaming}
                    disabled={!isOnline}
                  >
                    {isStreaming ? (
                      <>
                        <PauseCircle className="mr-2 h-4 w-4" /> Pause
                      </>
                    ) : (
                      <>
                        <PlayCircle className="mr-2 h-4 w-4" /> Play
                      </>
                    )}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleTakeSnapshot}
                    disabled={!isOnline || !isStreaming}
                  >
                    <Download className="mr-2 h-4 w-4" /> Snapshot
                  </Button>
                </div>
                
                {isOnline && isStreaming && (
                  <Badge variant="outline" className="bg-vision-dark-800/70 h-9 px-4 flex items-center">
                    Live
                  </Badge>
                )}
              </div>
            </div>
            
            <Tabs defaultValue="recordings" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="recordings">Recordings</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              <TabsContent value="recordings" className="border rounded-md p-4 mt-2">
                <div className="text-center p-8">
                  <h3 className="text-lg font-medium mb-2">No recordings available</h3>
                  <p className="text-muted-foreground">Recordings will appear here when available</p>
                </div>
              </TabsContent>
              <TabsContent value="events" className="border rounded-md p-4 mt-2">
                <div className="text-center p-8">
                  <h3 className="text-lg font-medium mb-2">No events detected</h3>
                  <p className="text-muted-foreground">Events will appear here when detected</p>
                </div>
              </TabsContent>
              <TabsContent value="analytics" className="border rounded-md p-4 mt-2">
                <div className="text-center p-8">
                  <h3 className="text-lg font-medium mb-2">Analytics not available</h3>
                  <p className="text-muted-foreground">
                    Enable analytics in settings to view data
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
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
                    <span className={`h-2 w-2 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`}></span>
                    {isOnline ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border rounded-md p-4">
              <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => {
                    // Implementation would open fullscreen mode
                    toast({
                      title: "Feature not available",
                      description: "Full screen view is not yet implemented.",
                    });
                  }}
                  disabled={!isOnline}
                >
                  View Full Screen
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => {
                    // Implementation would toggle recording
                    toast({
                      title: camera.recording ? "Recording stopped" : "Recording started",
                      description: camera.recording ? 
                        "Camera recording has been stopped." : 
                        "Camera has started recording.",
                    });
                  }}
                  disabled={!isOnline}
                >
                  {camera.recording ? "Stop Recording" : "Begin Recording"}
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => {
                    // Implementation would open motion detection settings
                    toast({
                      title: "Feature not available",
                      description: "Motion detection settings are not yet implemented.",
                    });
                  }}
                >
                  Configure Motion Detection
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CameraDetail;
