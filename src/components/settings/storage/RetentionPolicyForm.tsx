
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";

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

interface RetentionPolicyFormProps {
  form: UseFormReturn<StorageFormSchemaType>;
  isLoading: boolean;
}

const RetentionPolicyForm = ({ form, isLoading }: RetentionPolicyFormProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="retentionDays"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Retention Period (Days)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={1}
                max={365}
                {...field}
                disabled={isLoading}
              />
            </FormControl>
            <FormDescription>
              Number of days to keep recordings before automatic deletion
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="overwriteOldest"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Overwrite Oldest Recordings</FormLabel>
              <FormDescription>
                When storage is full, automatically delete the oldest recordings to make space
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isLoading}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
};

export default RetentionPolicyForm;
