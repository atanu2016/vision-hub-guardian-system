
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera as AssignmentCamera } from './types';

interface CameraAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

const CameraAssignmentModal = ({ isOpen, onClose, userId, userName }: CameraAssignmentModalProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>('All Cameras');
  
  const { 
    cameras, 
    loading, 
    saving, 
    error,
    canAssignCameras,
    isAuthenticated: hookIsAuthenticated,
    handleCameraToggle, 
    handleSave,
    loadCamerasAndAssignments,
    getAvailableGroups,
    getCamerasByGroup
  } = useAssignCameras(userId, isOpen);
  
  // Check authentication status when modal opens and periodically
  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        setIsAuthenticated(false);
        toast.error("You must be logged in to manage camera assignments");
        setTimeout(() => {
          onClose();
          // Redirect to auth page
          window.location.href = '/auth';
        }, 1500);
      } else {
        setIsAuthenticated(true);
      }
    };
    
    if (isOpen) {
      checkAuth();
    }
  }, [isOpen, onClose]);

  // Subscribe to auth state changes
  useEffect(() => {
    const { data: { subscription }} = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        onClose();
        // Redirect to auth page
        window.location.href = '/auth';
      } else if (session) {
        setIsAuthenticated(true);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [onClose]);

  const handleClose = () => {
    if (saving) {
      toast.error("Please wait until the save operation completes");
      return;
    }
    onClose();
  };

  const handleSubmit = async () => {
    // Check authentication status directly before performing the save
    const { data } = await supabase.auth.getSession();
    
    if (!data.session) {
      toast.error("You must be logged in to save camera assignments");
      onClose();
      // Redirect to auth page
      window.location.href = '/auth';
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
    // Check authentication status directly before refreshing
    const { data } = await supabase.auth.getSession();
    
    if (!data.session) {
      toast.error("You must be logged in to view camera assignments");
      onClose();
      // Redirect to auth page
      window.location.href = '/auth';
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

  // Check if the user is truly authenticated by combining all auth checks
  const combinedIsAuthenticated = isAuthenticated && hookIsAuthenticated;

  // Get cameras for the currently selected group
  const filteredCameras: AssignmentCamera[] = selectedGroup && getCamerasByGroup ? 
    getCamerasByGroup(selectedGroup) : 
    cameras;

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
          {!combinedIsAuthenticated && (
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
          
          {/* Camera Group Selection */}
          {getAvailableGroups && (
            <div className="mb-4">
              <Select
                value={selectedGroup}
                onValueChange={setSelectedGroup}
                disabled={loading || saving}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Camera Group" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableGroups().map((group) => (
                    <SelectItem key={group} value={group}>
                      {group} ({getCamerasByGroup && getCamerasByGroup(group).length})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <CameraList 
            cameras={filteredCameras}
            loading={loading}
            saving={saving}
            canAssignCameras={canAssignCameras && combinedIsAuthenticated}
            onToggle={handleCameraToggle}
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || saving || !!error || !canAssignCameras || !combinedIsAuthenticated}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
        
        {!combinedIsAuthenticated && (
          <div className="bg-red-100 dark:bg-red-950 p-3 rounded-md text-red-800 dark:text-red-300 text-sm">
            You must be logged in to manage camera assignments. Please log in again.
          </div>
        )}
        
        {combinedIsAuthenticated && !canAssignCameras && !loading && (
          <div className="bg-yellow-100 dark:bg-yellow-950 p-3 rounded-md text-yellow-800 dark:text-yellow-300 text-sm">
            You don't have permission to assign cameras. Please contact an administrator.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CameraAssignmentModal;
