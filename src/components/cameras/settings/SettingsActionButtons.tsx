
import { Button } from "@/components/ui/button";
import { Camera } from "@/types/camera";

interface SettingsActionButtonsProps {
  onSave: () => void;
  onReset: () => void;
  isLoading: boolean;
}

const SettingsActionButtons = ({ 
  onSave,
  onReset,
  isLoading
}: SettingsActionButtonsProps) => {
  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={onReset}>
        Reset
      </Button>
      <Button onClick={onSave} disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
};

export default SettingsActionButtons;
