
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
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

interface NasStorageFieldsProps {
  form: UseFormReturn<StorageFormSchemaType>;
  isLoading: boolean;
}

const NasStorageFields = ({ form, isLoading }: NasStorageFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="nasAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>NAS Address</FormLabel>
            <FormControl>
              <Input
                placeholder="192.168.1.100"
                {...field}
                value={field.value || ""}
                disabled={isLoading}
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="nasPath"
        render={({ field }) => (
          <FormItem>
            <FormLabel>NAS Share Path</FormLabel>
            <FormControl>
              <Input
                placeholder="/recordings"
                {...field}
                value={field.value || ""}
                disabled={isLoading}
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="nasUsername"
        render={({ field }) => (
          <FormItem>
            <FormLabel>NAS Username</FormLabel>
            <FormControl>
              <Input
                placeholder="username"
                {...field}
                value={field.value || ""}
                disabled={isLoading}
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="nasPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>NAS Password</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="••••••••"
                {...field}
                value={field.value || ""}
                disabled={isLoading}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
};

export default NasStorageFields;
