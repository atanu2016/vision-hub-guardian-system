
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StorageSettings } from "@/types/camera";

export interface StorageFormProps {
  initialSettings: StorageSettings;
  onSave: (settings: StorageSettings) => Promise<boolean>;
  isLoading: boolean;
  isSaving: boolean;
}

const StorageForm = ({
  initialSettings,
  onSave,
  isLoading,
  isSaving
}: StorageFormProps) => {
  const [settings, setSettings] = useState<StorageSettings>(initialSettings);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(settings);
  };

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic form implementation - expand as needed */}
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Storage Type</label>
          <select
            className="w-full p-2 border rounded"
            value={settings.type}
            onChange={(e) => setSettings({...settings, type: e.target.value as any})}
            disabled={isSaving}
          >
            <option value="local">Local Storage</option>
            <option value="nas">Network Attached Storage (NAS)</option>
            <option value="s3">Cloud Storage (S3)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Retention Period (days)</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={settings.retentiondays}
            onChange={(e) => setSettings({...settings, retentiondays: parseInt(e.target.value)})}
            min={1}
            max={365}
            disabled={isSaving}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="overwrite"
            checked={settings.overwriteoldest}
            onChange={(e) => setSettings({...settings, overwriteoldest: e.target.checked})}
            disabled={isSaving}
          />
          <label htmlFor="overwrite" className="text-sm font-medium">
            Overwrite oldest recordings when storage is full
          </label>
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={isSaving}
        className="w-full md:w-auto"
      >
        {isSaving ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
};

export default StorageForm;
