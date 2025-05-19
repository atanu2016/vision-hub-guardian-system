
import { useState } from 'react';
import { toast } from 'sonner';
import { checkAuthentication } from '@/hooks/camera-assignment/utils/authCheck';

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
  const [saveAttempts, setSaveAttempts] = useState(0);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showSlowWarning, setShowSlowWarning] = useState(false);

  const handleClose = () => {
    if (isSaving && !savingComplete) {
      const confirmClose = window.confirm("The save operation is still in progress. Are you sure you want to close?");
      if (!confirmClose) return;
      
      // Clear any pending timeout
      if (saveTimeout) clearTimeout(saveTimeout);
    }
    
    onClose();
    // Reset states when closing
    setSavingProgress(0);
    setSavingStep('');
    setSavingComplete(false);
    setSaveAttempts(0);
    setShowSlowWarning(false);
    if (saveTimeout) clearTimeout(saveTimeout);
  };

  const handleSubmit = async () => {
    // Check authentication first - most crucial check
    const isSessionValid = await checkAuthentication();
    if (!isSessionValid) {
      return; // checkAuthentication already shows toast and redirects
    }
    
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
      // Track save attempts
      setSaveAttempts(prev => prev + 1);
      
      // Clear any existing timeouts
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
      
      // Start feedback immediately
      const toastId = toast.loading("Saving camera assignments...");
      setIsSaving(true);
      setSavingStep('Saving camera assignment...');
      setSavingProgress(25);
      setShowSlowWarning(false);
      
      // Use a quicker timeout for the slow warning (1.5 seconds)
      const slowWarningTimeout = setTimeout(() => {
        if (isSaving && !savingComplete) {
          setShowSlowWarning(true);
        }
      }, 1500);
      
      // Use a more reasonable timeout (8 seconds instead of 15)
      const operationTimeout = setTimeout(() => {
        if (isSaving && !savingComplete) {
          toast.dismiss(toastId);
          toast.error("Operation timed out. Please try again.");
          setIsSaving(false);
          setSavingStep('');
          setSavingProgress(0);
        }
      }, 8000);
      
      setSaveTimeout(operationTimeout);
      
      // Show progress before actual save to improve perceived performance
      setSavingProgress(50);
      
      // Execute save operation
      const success = await handleSave();
      
      // Clear timeouts
      clearTimeout(slowWarningTimeout);
      clearTimeout(operationTimeout);
      setSaveTimeout(null);
      
      if (success) {
        // Show progress steps quickly
        setSavingProgress(100);
        setSavingStep('Assignment completed!');
        setSavingComplete(true);
        setShowSlowWarning(false);
        toast.dismiss(toastId);
        toast.success("Camera assignments saved successfully");
        
        // Close automatically after short delay
        setTimeout(() => {
          setIsSaving(false);
          setSavingStep('');
          onClose();
        }, 800);
      } else {
        setSavingProgress(0);
        setSavingStep('');
        setIsSaving(false);
        setShowSlowWarning(false);
        toast.dismiss(toastId);
        
        if (saveAttempts >= 2) {
          toast.error("Persistent error saving camera assignments. Try refreshing your browser or logging in again.");
        } else {
          toast.error("Failed to save camera assignments. Please try again.");
        }
      }
    } catch (error: any) {
      console.error("Error saving camera assignments:", error);
      toast.error(error?.message || "Failed to save camera assignments");
      setSavingStep('');
      setSavingProgress(0);
      setIsSaving(false);
      setShowSlowWarning(false);
      
      // Clear any pending timeout
      if (saveTimeout) {
        clearTimeout(saveTimeout);
        setSaveTimeout(null);
      }
    }
  };
  
  const handleRefresh = async () => {
    // Verify session before refresh
    const isSessionValid = await checkAuthentication();
    if (!isSessionValid) {
      return; // checkAuthentication already shows toast and redirects
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
    showSlowWarning,
    handleClose,
    handleSubmit,
    handleRefresh
  };
}
