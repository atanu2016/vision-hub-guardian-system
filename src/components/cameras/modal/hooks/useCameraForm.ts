
import { useState, useEffect, useCallback } from 'react';
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
  
  // Reset form state
  const resetForm = useCallback(() => {
    setFormState(initialState);
  }, []);
  
  // Field change handler
  const handleFieldChange = useCallback((field: string, value: string) => {
    console.log(`Changing field ${field} to:`, value);
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);
  
  // Handle connection tab change
  const handleTabChange = useCallback((tab: string) => {
    console.log(`Changing tab to: ${tab}`);
    const connectionType = tab as CameraConnectionType;
    
    setFormState(prev => ({
      ...prev,
      connectionTab: tab,
      connectionType
    }));
  }, []);

  // Handle group change
  const handleGroupChange = useCallback((value: string) => {
    setFormState(prev => ({
      ...prev,
      group: value
    }));
  }, []);
  
  // Set new group name
  const setNewGroupName = useCallback((value: string) => {
    setFormState(prev => ({
      ...prev,
      newGroupName: value
    }));
  }, []);
  
  // Set verification state
  const setIsVerifying = useCallback((isVerifying: boolean) => {
    setFormState(prev => ({
      ...prev,
      isVerifying
    }));
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
