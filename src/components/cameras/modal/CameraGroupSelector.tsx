
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CameraGroupSelectorProps {
  group: string;
  existingGroups: string[];
  newGroupName: string;
  onGroupChange: (value: string) => void;
  onNewGroupNameChange: (value: string) => void;
}

const CameraGroupSelector = ({
  group,
  existingGroups,
  newGroupName,
  onGroupChange,
  onNewGroupNameChange,
}: CameraGroupSelectorProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="group">Camera Group</Label>
        <Select 
          value={group} 
          onValueChange={onGroupChange}
        >
          <SelectTrigger id="group">
            <SelectValue placeholder="Select group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Ungrouped">Ungrouped</SelectItem>
            {existingGroups.map((groupName) => (
              <SelectItem key={groupName} value={groupName}>
                {groupName}
              </SelectItem>
            ))}
            <SelectItem value="new">+ Create New Group</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {group === "new" && (
        <div className="space-y-2">
          <Label htmlFor="newGroup">New Group Name</Label>
          <Input
            id="newGroup"
            value={newGroupName}
            onChange={(e) => onNewGroupNameChange(e.target.value)}
            placeholder="New Group Name"
            autoFocus
          />
        </div>
      )}
    </>
  );
};

export default CameraGroupSelector;
