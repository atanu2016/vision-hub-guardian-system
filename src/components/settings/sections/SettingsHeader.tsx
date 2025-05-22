
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface SettingsHeaderProps {
  onSaveAll: () => void;
  isSaving: boolean;
}

const SettingsHeader = ({ onSaveAll, isSaving }: SettingsHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">System Settings</h1>
      <Button 
        onClick={onSaveAll} 
        disabled={isSaving}
        className="gap-2"
      >
        <Save className="h-4 w-4" />
        Save All Changes
      </Button>
    </div>
  );
};

export default SettingsHeader;
