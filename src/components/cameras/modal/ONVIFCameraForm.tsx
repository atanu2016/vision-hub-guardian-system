
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ONVIFCameraFormProps {
  ipAddress: string;
  port: string;
  username: string;
  password: string;
  onvifPath: string;
  onChange: (field: string, value: string) => void;
}

const ONVIFCameraForm = ({
  ipAddress,
  port,
  username,
  password,
  onvifPath,
  onChange,
}: ONVIFCameraFormProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="onvifIp">IP Address*</Label>
          <Input
            id="onvifIp"
            value={ipAddress}
            onChange={(e) => onChange("ipAddress", e.target.value)}
            placeholder="192.168.1.100"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="onvifPort">Port*</Label>
          <Input
            id="onvifPort"
            value={port}
            onChange={(e) => onChange("port", e.target.value)}
            placeholder="8080"
            type="number"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="onvifUsername">Username*</Label>
          <Input
            id="onvifUsername"
            value={username}
            onChange={(e) => onChange("username", e.target.value)}
            placeholder="admin"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="onvifPassword">Password*</Label>
          <Input
            id="onvifPassword"
            type="password"
            value={password}
            onChange={(e) => onChange("password", e.target.value)}
            placeholder="•••••••••"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="onvifPath">ONVIF Path</Label>
        <Input
          id="onvifPath"
          value={onvifPath}
          onChange={(e) => onChange("onvifPath", e.target.value)}
          placeholder="/onvif/device_service"
        />
      </div>
    </>
  );
};

export default ONVIFCameraForm;
