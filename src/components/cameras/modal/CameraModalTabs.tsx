
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CameraConnectionType } from "@/types/camera";
import IPCameraForm from "./IPCameraForm";
import ONVIFCameraForm from "./ONVIFCameraForm";
import RTMPCameraForm from "./RTMPCameraForm";
import RTSPCameraForm from "./RTSPCameraForm";
import HLSCameraForm from "./HLSCameraForm";
import CameraTestButton from "./CameraTestButton";

interface CameraModalTabsProps {
  connectionTab: string;
  connectionType: CameraConnectionType;
  onTabChange: (tab: string) => void;
  formValues: {
    ipAddress: string;
    port: string;
    username: string;
    password: string;
    rtmpUrl: string;
    rtspUrl: string;
    hlsUrl: string;
    onvifPath: string;
    name: string;
    location: string;
    model: string;
    manufacturer: string;
    group: string;
    newGroupName: string;
    connectionType: CameraConnectionType;
    connectionTab: string;
    isVerifying: boolean;
  };
  onChange: (field: string, value: string) => void;
}

const CameraModalTabs = ({
  connectionTab,
  onTabChange,
  connectionType,
  formValues,
  onChange
}: CameraModalTabsProps) => {
  const handleTabChange = (tab: string) => {
    console.log("Tab changed to:", tab);
    onTabChange(tab);
  };

  const handleSuggestedUrl = (url: string) => {
    console.log("Using suggested URL:", url);
    if (connectionType === 'rtsp') {
      onChange('rtspUrl', url);
    }
  };
  
  return (
    <div>
      <Tabs value={connectionTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="ip">IP</TabsTrigger>
          <TabsTrigger value="rtsp">RTSP</TabsTrigger>
          <TabsTrigger value="rtmp">RTMP</TabsTrigger>
          <TabsTrigger value="hls">HLS</TabsTrigger>
          <TabsTrigger value="onvif">ONVIF</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ip" className="space-y-4">
          <IPCameraForm 
            ipAddress={formValues.ipAddress}
            port={formValues.port}
            username={formValues.username}
            password={formValues.password}
            onChange={onChange}
          />
          <CameraTestButton 
            formValues={formValues}
            disabled={formValues.isVerifying}
          />
        </TabsContent>
        
        <TabsContent value="rtsp" className="space-y-4">
          <RTSPCameraForm 
            rtspUrl={formValues.rtspUrl}
            onChange={onChange}
          />
          <CameraTestButton 
            formValues={formValues}
            disabled={formValues.isVerifying}
            onSuggestedUrl={handleSuggestedUrl}
          />
        </TabsContent>
        
        <TabsContent value="rtmp" className="space-y-4">
          <RTMPCameraForm 
            rtmpUrl={formValues.rtmpUrl}
            onChange={onChange}
          />
          <CameraTestButton 
            formValues={formValues}
            disabled={formValues.isVerifying}
          />
        </TabsContent>
        
        <TabsContent value="hls" className="space-y-4">
          <HLSCameraForm 
            hlsUrl={formValues.hlsUrl}
            onChange={onChange}
          />
          <CameraTestButton 
            formValues={formValues}
            disabled={formValues.isVerifying}
          />
        </TabsContent>
        
        <TabsContent value="onvif" className="space-y-4">
          <ONVIFCameraForm 
            ipAddress={formValues.ipAddress}
            port={formValues.port}
            username={formValues.username}
            password={formValues.password}
            onvifPath={formValues.onvifPath}
            onChange={onChange}
          />
          <CameraTestButton 
            formValues={formValues}
            disabled={formValues.isVerifying}
            onSuggestedUrl={handleSuggestedUrl}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CameraModalTabs;
