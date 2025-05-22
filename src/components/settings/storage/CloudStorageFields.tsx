
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { StorageFormSchemaType } from "./StorageForm";

interface CloudStorageFieldsProps {
  form: UseFormReturn<StorageFormSchemaType>;
  isLoading: boolean;
  providerType: "dropbox" | "google_drive" | "onedrive" | "azure_blob" | "backblaze";
}

// Creates the fields for cloud storage providers
const CloudStorageFields = ({ form, isLoading, providerType }: CloudStorageFieldsProps) => {
  // Dropbox fields
  if (providerType === "dropbox") {
    return (
      <>
        <FormField
          control={form.control}
          name="dropboxToken"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dropbox Access Token</FormLabel>
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
        
        <FormField
          control={form.control}
          name="dropboxFolder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dropbox Folder</FormLabel>
              <FormControl>
                <Input
                  placeholder="/Recordings"
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
  }

  // Google Drive fields
  if (providerType === "google_drive") {
    return (
      <>
        <FormField
          control={form.control}
          name="googleDriveToken"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Google Drive OAuth Token</FormLabel>
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
        
        <FormField
          control={form.control}
          name="googleDriveFolderId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Google Drive Folder ID</FormLabel>
              <FormControl>
                <Input
                  placeholder="1a2b3c4d5e..."
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
  }

  // OneDrive fields
  if (providerType === "onedrive") {
    return (
      <>
        <FormField
          control={form.control}
          name="oneDriveToken"
          render={({ field }) => (
            <FormItem>
              <FormLabel>OneDrive OAuth Token</FormLabel>
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
        
        <FormField
          control={form.control}
          name="oneDriveFolderId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>OneDrive Folder ID</FormLabel>
              <FormControl>
                <Input
                  placeholder="1a2b3c4d5e..."
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
  }

  // Azure Blob Storage fields
  if (providerType === "azure_blob") {
    return (
      <>
        <FormField
          control={form.control}
          name="azureConnectionString"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Azure Connection String</FormLabel>
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
        
        <FormField
          control={form.control}
          name="azureContainer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Azure Container</FormLabel>
              <FormControl>
                <Input
                  placeholder="recordings"
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
  }

  // Backblaze B2 fields
  if (providerType === "backblaze") {
    return (
      <>
        <FormField
          control={form.control}
          name="backblazeKeyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Backblaze Key ID</FormLabel>
              <FormControl>
                <Input
                  placeholder="001a2b3c4d5e..."
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
          name="backblazeApplicationKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Backblaze Application Key</FormLabel>
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
        
        <FormField
          control={form.control}
          name="backblazeBucket"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Backblaze Bucket</FormLabel>
              <FormControl>
                <Input
                  placeholder="recordings-bucket"
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
  }

  return null;
};

export default CloudStorageFields;
