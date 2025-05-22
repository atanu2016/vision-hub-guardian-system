
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IPCameraForm from "./IPCameraForm";
import ONVIFCameraForm from "./ONVIFCameraForm";
import RTMPCameraForm from "./RTMPCameraForm";
import HLSCameraForm from "./HLSCameraForm";
import RTSPCameraForm from "./RTSPCameraForm"; // Add import for RTSP form
import { CameraConnectionType } from "@/types/camera";

interface CameraModalTabsProps {
  connectionTab: string;
  onTabChange: (tab: string) => void;
  connectionType: CameraConnectionType;
  formValues: {
    ipAddress: string;
    port: string;
    username: string;
    password: string;
    rtmpUrl: string;
    rtspUrl: string; // Add rtspUrl to formValues
    hlsUrl: string;
    onvifPath: string;
  };
  onChange: (field: string, value: string) => void;
}

const CameraModalTabs = ({
  connectionTab,
  onTabChange,
  formValues,
  onChange,
}: CameraModalTabsProps) => {
  return (
    <div className="space-y-2">
      <Tabs 
        value={connectionTab} 
        onValueChange={tab => onTabChange(tab)}
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="ip">IP Camera</TabsTrigger>
          <TabsTrigger value="onvif">ONVIF</TabsTrigger>
          <TabsTrigger value="rtsp">RTSP</TabsTrigger>
          <TabsTrigger value="rtmp">RTMP</TabsTrigger>
          <TabsTrigger value="hls">HLS</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ip" className="space-y-4 pt-2">
          <IPCameraForm 
            ipAddress={formValues.ipAddress}
            port={formValues.port}
            username={formValues.username}
            password={formValues.password}
            onChange={onChange}
          />
        </TabsContent>
        
        <TabsContent value="onvif" className="space-y-4 pt-2">
          <ONVIFCameraForm 
            ipAddress={formValues.ipAddress}
            port={formValues.port}
            username={formValues.username}
            password={formValues.password}
            onvifPath={formValues.onvifPath}
            onChange={onChange}
          />
        </TabsContent>
        
        <TabsContent value="rtsp" className="space-y-4 pt-2">
          <RTSPCameraForm 
            rtspUrl={formValues.rtspUrl}
            onChange={onChange}
          />
        </TabsContent>
        
        <TabsContent value="rtmp" className="space-y-4 pt-2">
          <RTMPCameraForm 
            rtmpUrl={formValues.rtmpUrl}
            onChange={onChange}
          />
        </TabsContent>
        
        <TabsContent value="hls" className="space-y-4 pt-2">
          <HLSCameraForm 
            hlsUrl={formValues.hlsUrl}
            onChange={onChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CameraModalTabs;
