
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw, AlertCircle } from 'lucide-react';
import { useAssignCameras } from '@/hooks/camera-assignment';
import CameraList from './CameraList';
import { toast } from 'sonner';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera as AssignmentCamera } from './types';
import PermissionAlert from './PermissionAlert';

interface CameraAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

const CameraAssignmentModal = ({ isOpen, onClose, userId, userName }: CameraAssignmentModalProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>('All Cameras');
  const [savingStep, setSavingStep] = useState<string>('');
  
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
  
  // Optimized authentication check - only runs once when modal opens
  useEffect(() => {
    if (!isOpen || authChecked) return;
    
    const checkAuth = async () => {
      try {
        // Use cached session when available to avoid network request
        const { data, error } = await supabase.auth.getSession();
        
        if (error || !data.session) {
          console.error("Authentication check failed:", error || "No session found");
          setIsAuthenticated(false);
          toast.error("You must be logged in to manage camera assignments");
          
          setTimeout(() => {
            onClose();
            window.location.href = '/auth';
          }, 1500);
        } else {
          setIsAuthenticated(true);
        }
        
        setAuthChecked(true);
      } catch (err) {
        console.error("Authentication check error:", err);
        setIsAuthenticated(false);
        setAuthChecked(true);
      }
    };
    
    checkAuth();
  }, [isOpen, onClose, authChecked]);

  // Auth state subscription
  useEffect(() => {
    if (!isOpen) return;
    
    const { data: { subscription }} = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        onClose();
        window.location.href = '/auth';
      } else if (session) {
        setIsAuthenticated(true);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [isOpen, onClose]);

  const handleClose = () => {
    if (saving) {
      toast.error("Please wait until the save operation completes");
      return;
    }
    onClose();
  };

  const handleSubmit = async () => {
    // Combined auth check
    if (!isAuthenticated || !hookIsAuthenticated) {
      toast.error("Authentication required. Please login again");
      onClose();
      window.location.href = '/auth';
      return;
    }
    
    if (!canAssignCameras) {
      toast.error("You don't have permission to assign cameras");
      return;
    }
    
    try {
      // Improved progress feedback
      const toastId = toast.loading("Processing camera assignments...");
      
      // Display steps to improve user experience during long operations
      setSavingStep('Preparing camera assignments...');
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to update UI
      
      setSavingStep('Saving to database...');
      const success = await handleSave();
      
      setSavingStep('Finalizing...');
      toast.dismiss(toastId);
      
      if (success) {
        toast.success("Camera assignments saved successfully");
        setSavingStep('');
        onClose();
      }
    } catch (error: any) {
      console.error("Error saving camera assignments:", error);
      toast.error(error?.message || "Failed to save camera assignments");
      setSavingStep('');
    }
  };
  
  const handleRefresh = async () => {
    if (!isAuthenticated || !hookIsAuthenticated) {
      toast.error("Authentication required. Please login again");
      onClose();
      window.location.href = '/auth';
      return;
    }
    
    setIsRefreshing(true);
    try {
      await loadCamerasAndAssignments();
      toast.success("Camera list refreshed");
    } catch (error) {
      console.error("Error refreshing cameras:", error);
      toast.error("Failed to refresh cameras");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Combined auth check from both component and hook
  const isTrulyAuthenticated = isAuthenticated && hookIsAuthenticated;

  // Get cameras for the currently selected group
  const filteredCameras: AssignmentCamera[] = selectedGroup === 'All Cameras' ? 
    cameras : 
    (getCamerasByGroup ? getCamerasByGroup(selectedGroup) : []);

  // Show loading state while checking auth
  if (!authChecked) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md md:max-w-xl">
          <DialogHeader>
            <DialogTitle>Checking authentication...</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
              disabled={loading || isRefreshing || saving || !isTrulyAuthenticated}
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
          {!isTrulyAuthenticated && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Authentication required. Please login again.
              </AlertDescription>
            </Alert>
          )}
          
          <PermissionAlert hasPermission={canAssignCameras} />
          
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
                disabled={loading || saving || !isTrulyAuthenticated}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Camera Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Cameras">All Cameras</SelectItem>
                  {getAvailableGroups().filter(group => group !== 'All Cameras').map((group) => (
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
            canAssignCameras={canAssignCameras && isTrulyAuthenticated}
            onToggle={handleCameraToggle}
          />
          
          {saving && savingStep && (
            <div className="flex items-center mt-4 px-4 py-2 bg-muted rounded-md">
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              <span className="text-sm">{savingStep}</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || saving || !!error || !canAssignCameras || !isTrulyAuthenticated}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CameraAssignmentModal;
