import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, PauseCircle, PlayCircle, Settings, Share2, Trash2 } from "lucide-react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import AppLayout from "@/components/layout/AppLayout";
import { useState, useEffect } from "react";
import { getCameras, saveCamera, deleteCamera } from "@/services/apiService";
import { Camera } from "@/types/camera";
import { useToast } from "@/hooks/use-toast";
import CameraStreamPlayer from "@/components/cameras/CameraStreamPlayer";
import CameraSettings from "@/components/cameras/CameraSettings";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const CameraDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isStreaming, setIsStreaming] = useState(true);
  const [camera, setCamera] = useState<Camera | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("live");
  const [showSettings, setShowSettings] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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
  
  const handleToggleStreaming = () => {
    setIsStreaming(!isStreaming);
  };
  
  const handleTakeSnapshot = () => {
    if (!isStreaming || camera?.status !== 'online') {
      toast({
        title: "Cannot take snapshot",
        description: "Camera must be online and streaming to take a snapshot.",
        variant: "destructive",
      });
      return;
    }

    // Implementation would capture a frame from the video
    toast({
      title: "Snapshot taken",
      description: "Screenshot saved to recordings folder.",
    });
  };

  const handleSaveSettings = async (updatedCamera: Camera) => {
    try {
      await saveCamera(updatedCamera);
      setCamera(updatedCamera);
      setShowSettings(false);
      toast({
        title: "Settings saved",
        description: "Camera settings updated successfully.",
      });
    } catch (error) {
      console.error("Error saving camera settings:", error);
      toast({
        title: "Error",
        description: "Failed to save camera settings.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteCamera = async () => {
    if (!camera) return;
    
    try {
      await deleteCamera(camera.id);
      toast({
        title: "Camera deleted",
        description: "Camera has been successfully deleted.",
      });
      navigate('/');
    } catch (error) {
      console.error("Error deleting camera:", error);
      toast({
        title: "Error",
        description: "Failed to delete camera.",
        variant: "destructive",
      });
    }
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
  
  // Check camera status based on feed availability
  const isOnline = camera.status === "online" && isStreaming;
  
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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowSettings(true)}
            >
              <Settings className="mr-2 h-4 w-4" /> Configure
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative rounded-lg overflow-hidden border border-border">
              <CameraStreamPlayer 
                camera={camera} 
                autoPlay={isStreaming}
              />
              
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
                    // Open in fullscreen mode
                    const videoElement = document.querySelector('video');
                    if (videoElement) {
                      if (videoElement.requestFullscreen) {
                        videoElement.requestFullscreen();
                      } 
                    } else {
                      toast({
                        title: "Full screen error",
                        description: "Unable to enter full screen mode.",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={!isOnline}
                >
                  View Full Screen
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => {
                    // Toggle recording state
                    const updatedCamera = {
                      ...camera,
                      recording: !camera.recording
                    };
                    
                    setCamera(updatedCamera);
                    saveCamera(updatedCamera).then(() => {
                      toast({
                        title: updatedCamera.recording ? "Recording started" : "Recording stopped",
                        description: updatedCamera.recording ? 
                          "Camera has started recording." : 
                          "Camera recording has been stopped.",
                      });
                    });
                  }}
                  disabled={!isOnline}
                >
                  {camera.recording ? "Stop Recording" : "Begin Recording"}
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => setShowSettings(true)}
                >
                  Configure Camera Settings
                </Button>
                <Button 
                  className="w-full" 
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Camera
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">Camera Settings: {camera.name}</h2>
          <CameraSettings camera={camera} onSave={handleSaveSettings} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Camera</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {camera.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCamera} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default CameraDetail;
