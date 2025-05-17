
import { Trash2, HardDrive, History } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StorageSettingsProps {
  autoDeleteOld: boolean;
  maxStorageSize: number;
  backupSchedule: string;
  onChangeAutoDeleteOld: (enabled: boolean) => void;
  onChangeMaxStorageSize: (size: number) => void;
  onChangeBackupSchedule: (schedule: string) => void;
}

const StorageSettings = ({
  autoDeleteOld,
  maxStorageSize,
  backupSchedule,
  onChangeAutoDeleteOld,
  onChangeMaxStorageSize,
  onChangeBackupSchedule
}: StorageSettingsProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Storage Settings</h2>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Trash2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="auto-delete" className="font-medium">Auto Delete Old Recordings</Label>
              <p className="text-sm text-muted-foreground">Automatically delete recordings when storage is full</p>
            </div>
          </div>
          <Switch 
            id="auto-delete" 
            checked={autoDeleteOld} 
            onCheckedChange={onChangeAutoDeleteOld} 
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-4">
            <HardDrive className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="max-storage" className="font-medium">Maximum Storage Size</Label>
              <p className="text-sm text-muted-foreground">Set maximum space to use for recordings (GB)</p>
            </div>
          </div>
          <Input
            id="max-storage"
            type="number"
            value={maxStorageSize}
            onChange={(e) => onChangeMaxStorageSize(parseInt(e.target.value) || 0)}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-4">
            <History className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="backup-schedule" className="font-medium">Backup Schedule</Label>
              <p className="text-sm text-muted-foreground">Configure automatic backup schedule</p>
            </div>
          </div>
          <Select value={backupSchedule} onValueChange={onChangeBackupSchedule}>
            <SelectTrigger id="backup-schedule" className="w-full">
              <SelectValue placeholder="Select backup frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Never</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default StorageSettings;
