
import { useState } from 'react';
import { toast } from 'sonner';

interface ModalActionsProps {
  onClose: () => void;
  handleSave: () => Promise<boolean>;
  isAuthenticated: boolean;
  canAssignCameras: boolean;
  loadCamerasAndAssignments: () => Promise<void>;
}

export function useModalActions({ 
  onClose, 
  handleSave, 
  isAuthenticated, 
  canAssignCameras,
  loadCamerasAndAssignments
}: ModalActionsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savingStep, setSavingStep] = useState<string>('');
  const [savingProgress, setSavingProgress] = useState(0);
  const [savingComplete, setSavingComplete] = useState(false);

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
    if (!isAuthenticated) {
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
      // Optimized feedback - show immediate progress
      const toastId = toast.loading("Processing camera assignments...");
      setIsSaving(true);
      
      // Short feedback for better UX
      setSavingStep('Saving to database...');
      setSavingProgress(50);
      
      const success = await handleSave();
      
      // Quickly complete progress
      setSavingProgress(100);
      setSavingStep(success ? 'Assignment completed!' : 'Assignment failed');
      setSavingComplete(true);
      toast.dismiss(toastId);
      
      if (success) {
        toast.success("Camera assignments saved successfully");
        // Give user a brief moment to see success before closing
        setTimeout(() => {
          setIsSaving(false);
          setSavingStep('');
          onClose();
        }, 800);
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
    if (!isAuthenticated) {
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

  return {
    isRefreshing,
    isSaving,
    savingStep,
    savingProgress,
    savingComplete,
    handleClose,
    handleSubmit,
    handleRefresh
  };
}
