
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

interface S3StorageFieldsProps {
  form: UseFormReturn<StorageFormSchemaType>;
  isLoading: boolean;
}

const S3StorageFields = ({ form, isLoading }: S3StorageFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="s3Endpoint"
        render={({ field }) => (
          <FormItem>
            <FormLabel>S3 Endpoint</FormLabel>
            <FormControl>
              <Input
                placeholder="https://s3.amazonaws.com"
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
        name="s3Region"
        render={({ field }) => (
          <FormItem>
            <FormLabel>S3 Region</FormLabel>
            <FormControl>
              <Input
                placeholder="us-east-1"
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
        name="s3Bucket"
        render={({ field }) => (
          <FormItem>
            <FormLabel>S3 Bucket</FormLabel>
            <FormControl>
              <Input
                placeholder="my-recordings-bucket"
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
        name="s3AccessKey"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Access Key</FormLabel>
            <FormControl>
              <Input
                placeholder="AKIAIOSFODNN7EXAMPLE"
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
        name="s3SecretKey"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Secret Key</FormLabel>
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

export default S3StorageFields;
