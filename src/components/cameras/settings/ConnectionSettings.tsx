
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { SettingsSectionProps } from "./types";
import { suggestRtspUrls } from "@/utils/onvifTester";
import { validateConnectionSettings } from "./utils/connectionValidator";
import { ValidationErrors } from "./types";
import { CameraConnectionType } from "@/types/camera";

// Import connection type components
import ConnectionTypeSelector from "./connection/ConnectionTypeSelector";
import IPConnectionForm from "./connection/IPConnectionForm";
import ONVIFConnectionForm from "./connection/ONVIFConnectionForm";
import RTMPConnectionForm from "./connection/RTMPConnectionForm";
import HLSConnectionForm from "./connection/HLSConnectionForm";
import RTSPConnectionForm from "./connection/RTSPConnectionForm";
import CredentialsForm from "./connection/CredentialsForm";
import SuggestedURLsAlert from "./connection/SuggestedURLsAlert";

const ConnectionSettings = ({ cameraData, handleChange, disabled = false }: SettingsSectionProps) => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [previousConnectionType, setPreviousConnectionType] = useState(cameraData.connectionType);
  const [suggestedUrls, setSuggestedUrls] = useState<string[]>([]);
  
  // When connection type changes, offer helpful migration suggestions
  useEffect(() => {
    if (previousConnectionType !== cameraData.connectionType) {
      // If changing from ONVIF to RTSP, generate possible RTSP URLs
      if (previousConnectionType === 'onvif' && cameraData.connectionType === 'rtsp') {
        const urls = suggestRtspUrls(
          cameraData.ipAddress,
          cameraData.port,
          cameraData.username,
          cameraData.password,
          cameraData.manufacturer
        );
        setSuggestedUrls(urls);
      } else {
        setSuggestedUrls([]);
      }
      
      setPreviousConnectionType(cameraData.connectionType);
    }
  }, [cameraData.connectionType, previousConnectionType]);

  const handleFieldChange = (field: keyof typeof cameraData, value: string | number) => {
    const fieldErrors = validateConnectionSettings(
      { ...cameraData, [field]: value }, 
      cameraData.connectionType || 'ip'
    );
    
    setErrors(prev => {
      const updatedErrors = { ...prev };
      
      // Remove any errors for this field
      delete updatedErrors[field];
      
      // Add new error if validation failed
      if (fieldErrors[field]) {
        updatedErrors[field] = fieldErrors[field];
      }
      
      return updatedErrors;
    });
    
    handleChange(field, value);
  };

  const handleConnectionTypeChange = (type: CameraConnectionType) => {
    handleChange('connectionType', type);
  };

  const useSuggestedUrl = (url: string) => {
    handleChange('connectionType', 'rtsp');
    handleChange('rtmpUrl', url);
    setSuggestedUrls([]);
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="bg-muted/50">
        <CardTitle className="text-xl">Connection Settings</CardTitle>
        <CardDescription>Configure how to connect to this camera</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <SuggestedURLsAlert 
          suggestedUrls={suggestedUrls}
          onSelectUrl={useSuggestedUrl}
          disabled={disabled}
        />
      
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ConnectionTypeSelector
            connectionType={cameraData.connectionType || 'ip'}
            onChange={handleConnectionTypeChange}
            disabled={disabled}
          />
          
          {/* Show IP fields for non-streaming connection types */}
          {cameraData.connectionType !== 'rtmp' && cameraData.connectionType !== 'hls' && (
            <IPConnectionForm
              cameraData={cameraData}
              handleChange={handleFieldChange}
              errors={errors}
              disabled={disabled}
            />
          )}
        </div>
        
        {/* Form for RTMP connection type */}
        {(cameraData.connectionType === 'rtmp') && (
          <RTMPConnectionForm
            cameraData={cameraData}
            handleChange={handleFieldChange}
            errors={errors}
            disabled={disabled}
          />
        )}
        
        {/* Form for HLS connection type */}
        {(cameraData.connectionType === 'hls') && (
          <HLSConnectionForm
            cameraData={cameraData}
            handleChange={handleFieldChange}
            errors={errors}
            disabled={disabled}
          />
        )}
        
        {/* Form for RTSP connection type */}
        {(cameraData.connectionType === 'rtsp') && (
          <RTSPConnectionForm
            cameraData={cameraData}
            handleChange={handleFieldChange}
            errors={errors}
            disabled={disabled}
          />
        )}
        
        {/* Credentials form for non-streaming connection types */}
        {cameraData.connectionType !== 'rtmp' && cameraData.connectionType !== 'hls' && (
          <CredentialsForm
            cameraData={cameraData}
            handleChange={handleChange}
            disabled={disabled}
          />
        )}
        
        {/* ONVIF specific settings */}
        {cameraData.connectionType === 'onvif' && (
          <ONVIFConnectionForm
            cameraData={cameraData}
            handleChange={handleChange}
            disabled={disabled}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectionSettings;
