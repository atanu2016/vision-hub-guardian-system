
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CameraGroupSelectorProps {
  selectedGroup: string;
  setSelectedGroup: (group: string) => void;
  getAvailableGroups?: () => string[];
  getCamerasByGroup?: (group: string) => any[];
  loading: boolean;
  isSaving: boolean;
  isAuthenticated: boolean;
}

export const CameraGroupSelector = ({
  selectedGroup,
  setSelectedGroup,
  getAvailableGroups,
  getCamerasByGroup,
  loading,
  isSaving,
  isAuthenticated
}: CameraGroupSelectorProps) => {
  if (!getAvailableGroups) {
    return null;
  }

  return (
    <div className="mb-4">
      <Select
        value={selectedGroup}
        onValueChange={setSelectedGroup}
        disabled={loading || isSaving || !isAuthenticated}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Camera Group" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All Cameras">All Cameras</SelectItem>
          {getAvailableGroups().filter(group => group !== 'All Cameras').map((group) => (
            <SelectItem key={group} value={group}>
              {group} ({getCamerasByGroup && getCamerasByGroup(group).length})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
