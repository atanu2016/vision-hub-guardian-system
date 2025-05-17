
import { Button } from "@/components/ui/button";

interface UserInformation {
  username: string;
  role: string;
  email: string;
}

interface SystemInfo {
  version: string;
  license: string;
  lastUpdated: string;
}

interface SystemInformationProps {
  userInfo: UserInformation;
  systemInfo: SystemInfo;
  onCheckForUpdates: () => void;
}

const SystemInformation = ({
  userInfo,
  systemInfo,
  onCheckForUpdates
}: SystemInformationProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">System Information</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-base font-medium mb-4">User Information</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Username</span>
              <span className="font-medium">{userInfo.username}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Role</span>
              <span className="font-medium">{userInfo.role}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{userInfo.email}</span>
            </div>
          </div>
        </div>
        
        <div className="pt-2">
          <h3 className="text-base font-medium mb-4">System Information</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Version</span>
              <span className="font-medium">{systemInfo.version}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">License</span>
              <span className="font-medium text-green-500">{systemInfo.license}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Last Updated</span>
              <span className="font-medium">{systemInfo.lastUpdated}</span>
            </div>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={onCheckForUpdates}
        >
          Check for Updates
        </Button>
      </div>
    </div>
  );
};

export default SystemInformation;
