
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
  console.log("IPCameraForm - Received props:", { ipAddress, port, username, password });
  
  const handleIpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log("IPCameraForm - IP Address change:", newValue);
    onChange("ipAddress", newValue);
  };

  const handlePortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log("IPCameraForm - Port change:", newValue);
    onChange("port", newValue);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log("IPCameraForm - Username change:", newValue);
    onChange("username", newValue);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log("IPCameraForm - Password change:", newValue);
    onChange("password", newValue);
  };
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ipAddress">IP Address*</Label>
          <Input
            id="ipAddress"
            value={ipAddress}
            onChange={handleIpChange}
            placeholder="192.168.1.100"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="port">Port*</Label>
          <Input
            id="port"
            value={port}
            onChange={handlePortChange}
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
            onChange={handleUsernameChange}
            placeholder="admin"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="•••••••••"
          />
        </div>
      </div>
    </>
  );
};

export default IPCameraForm;
