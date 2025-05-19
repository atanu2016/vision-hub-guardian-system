
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
    // Fast authentication check
    const isSessionValid = await checkAuthentication();
    if (!isSessionValid) return;
    
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
      if (saveTimeout) clearTimeout(saveTimeout);
      
      // Start feedback immediately
      const toastId = toast.loading("Saving camera assignments...");
      setIsSaving(true);
      setSavingStep('Saving camera assignment...');
      setSavingProgress(25);
      setShowSlowWarning(false);
      
      // Use a quick timeout for the slow warning (1 second)
      const slowWarningTimeout = setTimeout(() => {
        if (isSaving && !savingComplete) {
          setShowSlowWarning(true);
        }
      }, 1000);
      
      // Use a shorter timeout (5 seconds instead of 8)
      const operationTimeout = setTimeout(() => {
        if (isSaving && !savingComplete) {
          toast.dismiss(toastId);
          toast.error("Operation timed out. Please try again.");
          setIsSaving(false);
          setSavingStep('');
          setSavingProgress(0);
        }
      }, 5000);
      
      setSaveTimeout(operationTimeout);
      
      // Show progress before actual save for better perceived performance
      setSavingProgress(50);
      
      // Execute save operation with an artificial minimum time of 300ms
      // to ensure progress animations look smooth and the UI feels responsive
      const startTime = Date.now();
      const success = await handleSave();
      const elapsedTime = Date.now() - startTime;
      
      // Ensure a minimum duration for better UX
      if (elapsedTime < 300) {
        await new Promise(resolve => setTimeout(resolve, 300 - elapsedTime));
      }
      
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
    // Verify session before refresh - use fast path
    if (!isAuthenticated) {
      toast.error("Authentication required. Please login again");
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
    showSlowWarning,
    handleClose,
    handleSubmit,
    handleRefresh
  };
}
