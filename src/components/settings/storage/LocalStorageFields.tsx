
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";

// Storage form schema type interface
interface StorageFormSchemaType {
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
}

interface LocalStorageFieldsProps {
  form: UseFormReturn<StorageFormSchemaType>;
  isLoading: boolean;
}

const LocalStorageFields = ({ form, isLoading }: LocalStorageFieldsProps) => {
  return (
    <FormField
      control={form.control}
      name="path"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Local Storage Path</FormLabel>
          <FormControl>
            <Input
              placeholder="/path/to/recordings"
              {...field}
              value={field.value || ""}
              disabled={isLoading}
            />
          </FormControl>
          <FormDescription>
            Path where recordings will be stored on the local filesystem
          </FormDescription>
        </FormItem>
      )}
    />
  );
};

export default LocalStorageFields;
