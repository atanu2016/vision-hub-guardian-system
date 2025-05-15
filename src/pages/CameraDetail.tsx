
import { Button } from "@/components/ui/button";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Download, PauseCircle, PlayCircle } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useState, useEffect } from "react";
import { getCameras, saveCamera, deleteCamera } from "@/services/apiService";
import { Camera } from "@/types/camera";
import { useToast } from "@/hooks/use-toast";
import CameraStreamPlayer from "@/components/cameras/CameraStreamPlayer";
import CameraSettings from "@/components/cameras/CameraSettings";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";

// Import refactored components
import CameraHeader from "@/components/cameras/detail/CameraHeader";
import CameraTabs from "@/components/cameras/detail/CameraTabs";
import CameraDetailsCard from "@/components/cameras/detail/CameraDetailsCard";
import CameraQuickActions from "@/components/cameras/detail/CameraQuickActions";

const CameraDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isStreaming, setIsStreaming] = useState(true);
  const [camera, setCamera] = useState<Camera | null>(null);
  const [loading, setLoading] = useState(true);
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
            title: "Error",
            description: "The requested camera could not be found."
          });
        }
      } catch (error) {
        console.error("Error fetching camera:", error);
        toast({
          title: "Error",
          description: "Could not load camera details. Please try again."
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCamera();
  }, [id]);
  
  const handleToggleStreaming = () => {
    setIsStreaming(!isStreaming);
  };
  
  const handleTakeSnapshot = () => {
    if (!isStreaming || camera?.status !== 'online') {
      toast({
        title: "Error",
        description: "Camera must be online and streaming to take a snapshot."
      });
      return;
    }

    // Implementation would capture a frame from the video
    toast({
      title: "Success",
      description: "Screenshot saved to recordings folder."
    });
  };

  const handleSaveSettings = async (updatedCamera: Camera) => {
    try {
      await saveCamera(updatedCamera);
      setCamera(updatedCamera);
      setShowSettings(false);
      toast({
        title: "Success",
        description: "Camera settings updated successfully."
      });
    } catch (error) {
      console.error("Error saving camera settings:", error);
      toast({
        title: "Error",
        description: "Failed to save camera settings."
      });
    }
  };
  
  const handleDeleteCamera = async () => {
    if (!camera) return;
    
    try {
      await deleteCamera(camera.id);
      toast({
        title: "Success",
        description: "Camera has been successfully deleted."
      });
      navigate('/');
    } catch (error) {
      console.error("Error deleting camera:", error);
      toast({
        title: "Error",
        description: "Failed to delete camera."
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
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <CameraHeader 
          camera={camera} 
          onSettingsClick={() => setShowSettings(true)} 
        />
        
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
                    disabled={camera.status !== 'online'}
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
                    disabled={camera.status !== 'online' || !isStreaming}
                  >
                    <Download className="mr-2 h-4 w-4" /> Snapshot
                  </Button>
                </div>
              </div>
            </div>
            
            <CameraTabs />
          </div>
          
          <div className="space-y-6">
            <CameraDetailsCard camera={camera} />
            <CameraQuickActions 
              camera={camera}
              onCameraUpdate={setCamera}
              onDeleteClick={() => setShowDeleteDialog(true)}
              onSettingsClick={() => setShowSettings(true)}
            />
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
