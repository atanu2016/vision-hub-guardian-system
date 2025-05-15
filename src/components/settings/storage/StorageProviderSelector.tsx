
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { HardDrive, Server, Cloud } from "lucide-react";

// Storage form schema type with required type field
type StorageFormSchemaType = {
  type: "local" | "nas" | "s3" | "dropbox" | "google_drive" | "onedrive" | "azure_blob" | "backblaze";
  path?: string;
  retentionDays: number;
  overwriteOldest: boolean;
  nasAddress?: string;
  nasPath?: string;
  nasUsername?: string;
  nasPassword?: string;
  s3Endpoint?: string;
  s3Bucket?: string;
  s3AccessKey?: string;
  s3SecretKey?: string;
  s3Region?: string;
  dropboxToken?: string;
  dropboxFolder?: string;
  googleDriveToken?: string;
  googleDriveFolderId?: string;
  oneDriveToken?: string;
  oneDriveFolderId?: string;
  azureConnectionString?: string;
  azureContainer?: string;
  backblazeKeyId?: string;
  backblazeApplicationKey?: string;
  backblazeBucket?: string;
};

interface StorageProviderSelectorProps {
  form: UseFormReturn<StorageFormSchemaType>;
  isLoading: boolean;
}

const StorageProviderSelector = ({ form, isLoading }: StorageProviderSelectorProps) => {
  return (
    <FormField
      control={form.control}
      name="type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Storage Type</FormLabel>
          <Select
            disabled={isLoading}
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select storage provider" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="local">
                <div className="flex items-center">
                  <HardDrive className="mr-2 h-4 w-4" />
                  <span>Local Storage</span>
                </div>
              </SelectItem>
              <SelectItem value="nas">
                <div className="flex items-center">
                  <Server className="mr-2 h-4 w-4" />
                  <span>NAS Storage</span>
                </div>
              </SelectItem>
              <SelectItem value="s3">
                <div className="flex items-center">
                  <Cloud className="mr-2 h-4 w-4" />
                  <span>S3 Compatible Storage</span>
                </div>
              </SelectItem>
              <SelectItem value="dropbox">
                <div className="flex items-center">
                  <Cloud className="mr-2 h-4 w-4" />
                  <span>Dropbox</span>
                </div>
              </SelectItem>
              <SelectItem value="google_drive">
                <div className="flex items-center">
                  <Cloud className="mr-2 h-4 w-4" />
                  <span>Google Drive</span>
                </div>
              </SelectItem>
              <SelectItem value="onedrive">
                <div className="flex items-center">
                  <Cloud className="mr-2 h-4 w-4" />
                  <span>OneDrive</span>
                </div>
              </SelectItem>
              <SelectItem value="azure_blob">
                <div className="flex items-center">
                  <Cloud className="mr-2 h-4 w-4" />
                  <span>Azure Blob Storage</span>
                </div>
              </SelectItem>
              <SelectItem value="backblaze">
                <div className="flex items-center">
                  <Cloud className="mr-2 h-4 w-4" />
                  <span>Backblaze B2</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
};

export default StorageProviderSelector;
