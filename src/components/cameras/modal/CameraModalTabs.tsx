
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CameraConnectionType } from "@/types/camera";
import IPCameraForm from "./IPCameraForm";
import ONVIFCameraForm from "./ONVIFCameraForm";
import RTMPCameraForm from "./RTMPCameraForm";
import RTSPCameraForm from "./RTSPCameraForm";
import HLSCameraForm from "./HLSCameraForm";

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
  console.log("CameraModalTabs rendered, connectionType:", connectionType);
  console.log("Form values in Tabs:", formValues);
  
  return (
    <div>
      <Tabs value={connectionTab} onValueChange={onTabChange} className="w-full">
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
        </TabsContent>
        
        <TabsContent value="rtsp" className="space-y-4">
          <RTSPCameraForm 
            rtspUrl={formValues.rtspUrl}
            onChange={onChange}
          />
        </TabsContent>
        
        <TabsContent value="rtmp" className="space-y-4">
          <RTMPCameraForm 
            rtmpUrl={formValues.rtmpUrl}
            onChange={onChange}
          />
        </TabsContent>
        
        <TabsContent value="hls" className="space-y-4">
          <HLSCameraForm 
            hlsUrl={formValues.hlsUrl}
            onChange={onChange}
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CameraModalTabs;
