
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { useAssignCameras } from '@/hooks/camera-assignment/useAssignCameras';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface CameraAssignmentModalProps {
  userId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CameraAssignmentModal({
  userId,
  isOpen,
  onOpenChange,
}: CameraAssignmentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const {
    cameras,
    loading,
    saving,
    canAssignCameras,
    isAuthenticated,
    error,
    handleCameraToggle,
    handleSave,
    loadCamerasAndAssignments
  } = useAssignCameras(userId, isOpen);

  // Check authentication status when opened
  useEffect(() => {
    if (isOpen && !isAuthenticated) {
      // If not authenticated when the modal is opened, show an error
      console.log("Camera assignment modal opened without authentication");
      setTimeout(() => {
        toast.error("Please log in to manage camera assignments");
        onOpenChange(false);
        navigate('/auth');
      }, 500);
    }
  }, [isOpen, isAuthenticated, navigate, onOpenChange]);

  const handleRefresh = async () => {
    try {
      await loadCamerasAndAssignments();
      toast.success("Camera data refreshed");
    } catch (error) {
      console.error("Error refreshing camera data:", error);
      toast.error("Failed to refresh camera data");
    }
  };

  // Handle save button click
  const handleSaveClick = async () => {
    if (!isAuthenticated) {
      toast.error("You need to be logged in to assign cameras");
      onOpenChange(false);
      navigate('/auth');
      return;
    }
    
    setIsProcessing(true);
    try {
      const success = await handleSave();
      if (success) {
        onOpenChange(false);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Cameras</DialogTitle>
          <DialogDescription>
            Select cameras to assign to this user
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <div className="text-destructive space-y-2">
            <p>Error loading cameras: {error}</p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              Retry
            </Button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading cameras...</span>
          </div>
        ) : !isAuthenticated ? (
          <div className="text-destructive space-y-2">
            <p>Authentication required. Please log in to assign cameras.</p>
            <Button 
              onClick={() => {
                onOpenChange(false);
                navigate('/auth');
              }} 
              variant="default"
            >
              Go to Login
            </Button>
          </div>
        ) : cameras.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>No cameras available</p>
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
            {cameras.map((camera) => (
              <div key={camera.id} className="flex items-center space-x-2 py-2">
                <Checkbox
                  id={`camera-${camera.id}`}
                  checked={camera.assigned}
                  onCheckedChange={(checked) => {
                    handleCameraToggle(camera.id, checked === true);
                  }}
                  disabled={saving}
                />
                <label
                  htmlFor={`camera-${camera.id}`}
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {camera.name} ({camera.location})
                </label>
              </div>
            ))}
          </div>
        )}

        <DialogFooter className="flex items-center justify-between">
          <div>
            {!loading && !error && (
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm" 
                disabled={loading || isProcessing}
              >
                Refresh
              </Button>
            )}
          </div>
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveClick}
              disabled={loading || saving || isProcessing || !canAssignCameras || !isAuthenticated}
            >
              {saving || isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
