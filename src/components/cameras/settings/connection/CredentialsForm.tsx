
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SettingsConnectionProps } from "../types";

const CredentialsForm = ({ 
  cameraData, 
  handleChange, 
  disabled = false 
}: SettingsConnectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-border">
      <div className="space-y-2">
        <Label htmlFor="username" className="text-sm font-medium">Username</Label>
        <Input
          id="username"
          value={cameraData.username || ''}
          onChange={(e) => handleChange('username', e.target.value)}
          placeholder="admin"
          disabled={disabled}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">Password</Label>
        <Input
          id="password"
          type="password"
          value={cameraData.password || ''}
          placeholder="••••••••"
          onChange={(e) => handleChange('password', e.target.value)}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default CredentialsForm;
