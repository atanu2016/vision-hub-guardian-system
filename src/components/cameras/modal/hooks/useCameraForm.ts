
import { useState, useCallback, useRef } from 'react';
import { CameraConnectionType } from '@/types/camera';
import { CameraFormValues } from '../types/cameraModalTypes';

export function useCameraForm() {
  // Create initial form state
  const initialState: CameraFormValues = {
    name: '',
    location: '',
    ipAddress: '192.168.1.100',
    port: '80',
    username: '',
    password: '',
    group: '',
    newGroupName: '',
    model: '',
    manufacturer: '',
    connectionType: 'ip',
    rtmpUrl: '',
    rtspUrl: '',
    hlsUrl: '',
    onvifPath: '/onvif/device_service',
    connectionTab: 'ip',
    isVerifying: false
  };
  
  const [formState, setFormState] = useState<CameraFormValues>(initialState);
  const isResettingRef = useRef(false);
  
  console.log("useCameraForm - Current form state:", formState);
  
  // Reset form state
  const resetForm = useCallback(() => {
    if (isResettingRef.current) return; // Prevent multiple resets
    
    isResettingRef.current = true;
    console.log("Resetting form to initial state");
    setFormState(initialState);
    
    // Allow resets again after a brief delay
    setTimeout(() => {
      isResettingRef.current = false;
    }, 100);
  }, []);
  
  // Field change handler with debouncing
  const handleFieldChange = useCallback((field: string, value: string) => {
    if (isResettingRef.current) {
      console.log("Ignoring field change during reset");
      return;
    }
    
    console.log(`useCameraForm - Changing field ${field} to:`, value);
    setFormState(prev => {
      const newState = {
        ...prev,
        [field]: value
      };
      console.log("useCameraForm - New state after change:", newState);
      return newState;
    });
  }, []);
  
  // Handle connection tab change
  const handleTabChange = useCallback((tab: string) => {
    if (isResettingRef.current) return;
    
    console.log(`useCameraForm - Changing tab to: ${tab}`);
    const connectionType = tab as CameraConnectionType;
    
    setFormState(prev => {
      const newState = {
        ...prev,
        connectionTab: tab,
        connectionType
      };
      console.log("useCameraForm - New state after tab change:", newState);
      return newState;
    });
  }, []);

  // Handle group change
  const handleGroupChange = useCallback((value: string) => {
    if (isResettingRef.current) return;
    
    console.log(`useCameraForm - Changing group to: ${value}`);
    setFormState(prev => {
      const newState = {
        ...prev,
        group: value
      };
      console.log("useCameraForm - New state after group change:", newState);
      return newState;
    });
  }, []);
  
  // Set new group name
  const setNewGroupName = useCallback((value: string) => {
    if (isResettingRef.current) return;
    
    console.log(`useCameraForm - Setting new group name to: ${value}`);
    setFormState(prev => {
      const newState = {
        ...prev,
        newGroupName: value
      };
      console.log("useCameraForm - New state after new group name change:", newState);
      return newState;
    });
  }, []);
  
  // Set verification state
  const setIsVerifying = useCallback((isVerifying: boolean) => {
    console.log(`useCameraForm - Setting verification state to: ${isVerifying}`);
    setFormState(prev => {
      const newState = {
        ...prev,
        isVerifying
      };
      console.log("useCameraForm - New state after verification change:", newState);
      return newState;
    });
  }, []);
  
  return {
    formState,
    formActions: {
      handleFieldChange,
      handleTabChange,
      handleGroupChange,
      resetForm,
      setNewGroupName,
      setIsVerifying
    }
  };
}
