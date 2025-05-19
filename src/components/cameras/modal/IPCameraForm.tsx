
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface IPCameraFormProps {
  ipAddress: string;
  port: string;
  username: string;
  password: string;
  onChange: (field: string, value: string) => void;
}

const IPCameraForm = ({
  ipAddress,
  port,
  username,
  password,
  onChange,
}: IPCameraFormProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ipAddress">IP Address*</Label>
          <Input
            id="ipAddress"
            value={ipAddress}
            onChange={(e) => onChange("ipAddress", e.target.value)}
            placeholder="192.168.1.100"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="port">Port*</Label>
          <Input
            id="port"
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
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => onChange("username", e.target.value)}
            placeholder="admin"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => onChange("password", e.target.value)}
            placeholder="•••••••••"
          />
        </div>
      </div>
    </>
  );
};

export default IPCameraForm;
