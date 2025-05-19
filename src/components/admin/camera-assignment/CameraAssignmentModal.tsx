
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw } from 'lucide-react';
import { useAssignCameras } from '@/hooks/camera-assignment';
import CameraList from './CameraList';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';

interface CameraAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

const CameraAssignmentModal = ({ isOpen, onClose, userId, userName }: CameraAssignmentModalProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const { 
    cameras, 
    loading, 
    saving, 
    error,
    canAssignCameras,
    handleCameraToggle, 
    handleSave,
    loadCamerasAndAssignments
  } = useAssignCameras(userId, isOpen);

  // Check authentication status when modal opens
  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        setIsAuthenticated(false);
        toast.error("You must be logged in to manage camera assignments");
        onClose();
      } else {
        setIsAuthenticated(true);
      }
    };
    
    if (isOpen) {
      checkAuth();
    }
  }, [isOpen, onClose]);

  const handleClose = () => {
    if (saving) {
      toast.error("Please wait until the save operation completes");
      return;
    }
    onClose();
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to save camera assignments");
      return;
    }
    
    if (!canAssignCameras) {
      toast.error("You don't have permission to assign cameras");
      return;
    }
    
    const success = await handleSave();
    if (success) {
      toast.success("Camera assignments saved successfully");
      onClose();
    }
  };
  
  const handleRefresh = async () => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to view camera assignments");
      return;
    }
    
    setIsRefreshing(true);
    try {
      await loadCamerasAndAssignments();
      toast.success("Camera assignments refreshed");
    } catch (error) {
      toast.error("Failed to refresh cameras");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md md:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Assign Cameras to {userName}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh} 
              disabled={loading || isRefreshing || saving}
              className="ml-auto"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCcw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {!isAuthenticated && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You must be logged in to manage camera assignments
              </AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                <Button 
                  variant="link" 
                  className="p-0 h-auto ml-2 text-destructive underline" 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  Try refreshing
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          <CameraList 
            cameras={cameras}
            loading={loading}
            saving={saving}
            canAssignCameras={canAssignCameras && isAuthenticated}
            onToggle={handleCameraToggle}
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || saving || !!error || !canAssignCameras || !isAuthenticated}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
        
        {!isAuthenticated && (
          <div className="bg-red-100 dark:bg-red-950 p-3 rounded-md text-red-800 dark:text-red-300 text-sm">
            You must be logged in to manage camera assignments. Please log in again.
          </div>
        )}
        
        {isAuthenticated && !canAssignCameras && !loading && (
          <div className="bg-yellow-100 dark:bg-yellow-950 p-3 rounded-md text-yellow-800 dark:text-yellow-300 text-sm">
            You don't have permission to assign cameras. Please contact an administrator.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CameraAssignmentModal;
