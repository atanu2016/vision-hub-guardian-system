
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

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
      <div className="space-y-4">
        <div className="p-3 bg-muted/50 rounded-md border border-amber-200/20 flex items-start gap-2">
          <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p>To connect to an ONVIF camera, you'll need:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>The camera's IP address and port (typically 80, 8000, or 8080)</li>
              <li>ONVIF credentials (often different from web interface credentials)</li>
              <li>ONVIF service path (usually "/onvif/device_service")</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="onvifIp" className={cn("flex items-center justify-between")}>
            IP Address*
            <span className="text-xs font-normal text-muted-foreground">Example: 192.168.1.100</span>
          </Label>
          <Input
            id="onvifIp"
            value={ipAddress}
            onChange={(e) => onChange("ipAddress", e.target.value)}
            placeholder="192.168.1.100"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="onvifPort" className={cn("flex items-center justify-between")}>
            Port*
            <span className="text-xs font-normal text-muted-foreground">Common: 80, 8000, 8080</span>
          </Label>
          <Input
            id="onvifPort"
            value={port}
            onChange={(e) => onChange("port", e.target.value)}
            placeholder="80"
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
        <Label htmlFor="onvifPath" className={cn("flex items-center justify-between")}>
          ONVIF Path
          <span className="text-xs font-normal text-muted-foreground">Usually /onvif/device_service</span>
        </Label>
        <Input
          id="onvifPath"
          value={onvifPath}
          onChange={(e) => onChange("onvifPath", e.target.value)}
          placeholder="/onvif/device_service"
        />
      </div>

      <div className="text-sm text-muted-foreground mt-4">
        <p>* Required fields</p>
      </div>
    </>
  );
};

export default ONVIFCameraForm;
