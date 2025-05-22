
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface SettingsHeaderProps {
  onSaveAll: () => void;
  isSaving: boolean;
}

const SettingsHeader = ({ onSaveAll, isSaving }: SettingsHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold">System Settings</h2>
      <Button 
        onClick={onSaveAll}
        disabled={isSaving}
        className="flex items-center gap-2"
      >
        <Save className="h-4 w-4" />
        Save All Changes
      </Button>
    </div>
  );
};

export default SettingsHeader;
