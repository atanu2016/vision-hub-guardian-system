
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Loader2 } from 'lucide-react';
import { useAssignCameras } from '@/hooks/camera-assignment';
import CameraList from './CameraList';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Camera as AssignmentCamera } from './types';
import { ModalHeader } from './ModalHeader';
import { ErrorAlerts } from './ErrorAlerts';
import { CameraGroupSelector } from './CameraGroupSelector';
import { SavingProgress } from './SavingProgress';
import { ModalActions } from './ModalActions';

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
  const [savingProgress, setSavingProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [savingComplete, setSavingComplete] = useState(false);
  
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
    if (isSaving) {
      toast.error("Please wait until the save operation completes");
      return;
    }
    onClose();
    // Reset states when closing
    setSavingProgress(0);
    setSavingStep('');
    setSavingComplete(false);
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
      setIsSaving(true);
      
      // Display steps to improve user experience during long operations
      setSavingStep('Preparing camera assignments...');
      setSavingProgress(10);
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to update UI
      
      setSavingStep('Saving to database...');
      setSavingProgress(30);
      
      // Simulate progress updates during the save operation
      const progressInterval = setInterval(() => {
        setSavingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 5;
        });
      }, 1000);
      
      const success = await handleSave();
      clearInterval(progressInterval);
      
      setSavingStep(success ? 'Assignment completed!' : 'Assignment failed');
      setSavingProgress(100);
      setSavingComplete(true);
      toast.dismiss(toastId);
      
      if (success) {
        toast.success("Camera assignments saved successfully");
        // Give user a moment to see the success message
        setTimeout(() => {
          setIsSaving(false);
          setSavingStep('');
          onClose();
        }, 1500);
      } else {
        setIsSaving(false);
      }
    } catch (error: any) {
      console.error("Error saving camera assignments:", error);
      toast.error(error?.message || "Failed to save camera assignments");
      setSavingStep('');
      setIsSaving(false);
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
            <div className="text-lg font-semibold leading-none tracking-tight">Checking authentication...</div>
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
          <ModalHeader 
            userName={userName}
            isRefreshing={isRefreshing}
            loading={loading}
            isSaving={isSaving}
            isAuthenticated={isTrulyAuthenticated}
            onRefresh={handleRefresh}
          />
        </DialogHeader>
        
        <div className="py-4">
          <ErrorAlerts 
            isAuthenticated={isTrulyAuthenticated}
            canAssignCameras={canAssignCameras}
            error={error}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
          
          {/* Camera Group Selection */}
          <CameraGroupSelector 
            selectedGroup={selectedGroup}
            setSelectedGroup={setSelectedGroup}
            getAvailableGroups={getAvailableGroups}
            getCamerasByGroup={getCamerasByGroup}
            loading={loading}
            isSaving={isSaving}
            isAuthenticated={isTrulyAuthenticated}
          />
          
          {/* Only show the camera list when not saving */}
          {!isSaving ? (
            <CameraList 
              cameras={filteredCameras}
              loading={loading}
              saving={isSaving}
              canAssignCameras={canAssignCameras && isTrulyAuthenticated}
              onToggle={handleCameraToggle}
            />
          ) : (
            <SavingProgress 
              isSaving={isSaving}
              savingStep={savingStep}
              savingProgress={savingProgress}
              savingComplete={savingComplete}
            />
          )}
        </div>
        
        <ModalActions 
          onClose={handleClose}
          onSubmit={handleSubmit}
          isSaving={isSaving}
          savingComplete={savingComplete}
          loading={loading}
          error={error}
          canAssignCameras={canAssignCameras}
          isAuthenticated={isTrulyAuthenticated}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CameraAssignmentModal;
