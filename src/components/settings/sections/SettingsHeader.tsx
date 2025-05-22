
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface SettingsHeaderProps {
  onSaveAll?: () => void;
  isSaving?: boolean;
  title?: string;
  description?: string;
}

const SettingsHeader = ({ 
  onSaveAll = () => {}, 
  isSaving = false,
  title = "System Settings", 
  description = "Configure system appearance and behavior" 
}: SettingsHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>
      {onSaveAll && (
        <Button 
          onClick={onSaveAll}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save All Changes
        </Button>
      )}
    </div>
  );
};

export default SettingsHeader;
